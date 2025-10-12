-- Rica Multi-tenant Credit System Database Schema
-- PostgreSQL schema for production-ready credit metering and billing system

-- ============================================================================
-- CORE TENANT MANAGEMENT
-- ============================================================================

-- Tenants table (main tenant registry)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    namespace VARCHAR(100) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) NOT NULL CHECK (subscription_tier IN ('payg', 'personal', 'team', 'enterprise')),
    credit_balance DECIMAL(10, 4) DEFAULT 0 CHECK (credit_balance >= 0),

    -- Subscription limits
    minimum_credits INTEGER NOT NULL DEFAULT 10,
    cpu_quota INTEGER NOT NULL DEFAULT 500, -- millicores
    memory_quota INTEGER NOT NULL DEFAULT 1, -- GiB
    storage_quota INTEGER NOT NULL DEFAULT 5, -- GiB

    -- Subscription metadata
    stripe_customer_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'unpaid', 'incomplete')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP DEFAULT NOW(),

    -- Status and metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted', 'trial')),

    -- Additional metadata
    metadata JSONB DEFAULT '{}',

    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_namespace CHECK (namespace ~* '^[a-z0-9]([-a-z0-9]*[a-z0-9])?$')
);

-- ============================================================================
-- USAGE TRACKING AND BILLING
-- ============================================================================

-- Usage records table (persisted from Redis)
CREATE TABLE usage_records (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Usage details
    resource_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 8) NOT NULL CHECK (amount > 0),
    cost DECIMAL(10, 8) NOT NULL CHECK (cost >= 0),

    -- Usage metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    recorded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Partitioning support (for large scale)
    PARTITION BY RANGE (recorded_at)
);

-- Indexes for performance
CREATE INDEX idx_usage_records_tenant_date ON usage_records(tenant_id, recorded_at DESC);
CREATE INDEX idx_usage_records_resource ON usage_records(resource_type);
CREATE INDEX idx_usage_records_tenant_resource ON usage_records(tenant_id, resource_type);
CREATE INDEX idx_usage_records_cost ON usage_records(cost DESC) WHERE cost > 0;

-- ============================================================================
-- AD REVENUE AND MONETIZATION
-- ============================================================================

-- Ad revenue log (for ad-based credit earning)
CREATE TABLE ad_revenue_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Ad details
    ad_type VARCHAR(50) NOT NULL CHECK (ad_type IN ('video_ad_view', 'banner_impression', 'interstitial_ad', 'sponsored_content', 'rewarded_video')),
    count INTEGER DEFAULT 1 CHECK (count > 0),
    credits_earned DECIMAL(10, 6) NOT NULL CHECK (credits_earned > 0),

    -- Ad metadata
    metadata JSONB DEFAULT '{}', -- placement, duration, etc.

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    -- Partitioning support
    PARTITION BY RANGE (created_at)
);

-- Indexes
CREATE INDEX idx_ad_revenue_tenant_date ON ad_revenue_log(tenant_id, created_at DESC);
CREATE INDEX idx_ad_revenue_type ON ad_revenue_log(ad_type);

-- ============================================================================
-- CREDIT TRANSACTIONS (AUDIT TRAIL)
-- ============================================================================

-- Credit transactions table (complete audit trail)
CREATE TABLE credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'ad_revenue', 'refund', 'bonus', 'adjustment', 'transfer')),
    amount DECIMAL(10, 4) NOT NULL,
    balance_before DECIMAL(10, 4) NOT NULL,
    balance_after DECIMAL(10, 4) NOT NULL,

    -- Transaction metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',

    -- External references
    payment_id BIGINT REFERENCES payment_records(id),
    usage_id BIGINT REFERENCES usage_records(id),
    ad_revenue_id BIGINT REFERENCES ad_revenue_log(id),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    -- Partitioning support
    PARTITION BY RANGE (created_at)
);

-- Indexes for performance and querying
CREATE INDEX idx_credit_transactions_tenant ON credit_transactions(tenant_id, created_at DESC);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type, created_at DESC);
CREATE INDEX idx_credit_transactions_amount ON credit_transactions(ABS(amount) DESC) WHERE amount != 0;

-- ============================================================================
-- PAYMENT PROCESSING
-- ============================================================================

-- Payment records (payment gateway integration)
CREATE TABLE payment_records (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Payment details
    payment_provider VARCHAR(50) NOT NULL CHECK (payment_provider IN ('stripe', 'clickpesa', 'paypal', 'bank_transfer')),
    payment_method VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',

    -- Credit conversion
    credits_purchased DECIMAL(10, 4) NOT NULL CHECK (credits_purchased > 0),
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,

    -- Status and tracking
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
    provider_transaction_id VARCHAR(255),
    provider_fee DECIMAL(10, 2) DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    -- Partitioning support
    PARTITION BY RANGE (created_at)
);

-- Indexes
CREATE INDEX idx_payment_records_tenant ON payment_records(tenant_id, created_at DESC);
CREATE INDEX idx_payment_records_status ON payment_records(status, created_at DESC);
CREATE INDEX idx_payment_records_provider ON payment_records(payment_provider, provider_transaction_id);

-- ============================================================================
-- ANALYTICS AND REPORTING
-- ============================================================================

-- Service usage aggregated (daily rollup for analytics)
CREATE TABLE service_usage_daily (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_name VARCHAR(50) NOT NULL,
    date DATE NOT NULL,

    -- Aggregated metrics
    total_usage DECIMAL(10, 6) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    usage_count INTEGER DEFAULT 0,

    -- Additional metrics
    peak_usage DECIMAL(10, 6) DEFAULT 0,
    avg_usage DECIMAL(10, 6) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    UNIQUE(tenant_id, service_name, date),
    CHECK (date >= '2024-01-01'), -- Reasonable date constraint
    CHECK (total_usage >= 0),
    CHECK (total_cost >= 0)
);

-- Indexes for analytics queries
CREATE INDEX idx_service_usage_daily_tenant_date ON service_usage_daily(tenant_id, date DESC);
CREATE INDEX idx_service_usage_daily_service_date ON service_usage_daily(service_name, date DESC);
CREATE INDEX idx_service_usage_daily_cost ON service_usage_daily(total_cost DESC) WHERE total_cost > 0;

-- ============================================================================
-- ALERTS AND NOTIFICATIONS
-- ============================================================================

-- Credit alerts and notifications
CREATE TABLE credit_alerts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Alert details
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_credits', 'depleted', 'high_usage', 'quota_exceeded', 'suspicious_activity', 'payment_failed')),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),

    -- Threshold and values
    threshold DECIMAL(10, 4),
    current_value DECIMAL(10, 4),
    projected_value DECIMAL(10, 4),

    -- Alert content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Status and delivery
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'acknowledged')),
    delivery_method VARCHAR(50) DEFAULT 'dashboard' CHECK (delivery_method IN ('dashboard', 'email', 'sms', 'webhook')),

    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,

    -- Auto-resolution
    auto_resolve BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,

    -- Partitioning support
    PARTITION BY RANGE (created_at)
);

-- Indexes for alert management
CREATE INDEX idx_credit_alerts_tenant_unread ON credit_alerts(tenant_id, is_read, created_at DESC);
CREATE INDEX idx_credit_alerts_status ON credit_alerts(status, created_at DESC);
CREATE INDEX idx_credit_alerts_severity ON credit_alerts(severity, created_at DESC);

-- ============================================================================
-- ADVERTISING SYSTEM (FOR REVENUE GENERATION)
-- ============================================================================

-- Ad campaigns (for advertisers)
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Campaign details
    campaign_name VARCHAR(255) NOT NULL,
    campaign_description TEXT,

    -- Targeting and content
    ad_type VARCHAR(50) NOT NULL CHECK (ad_type IN ('video', 'banner', 'interstitial', 'native', 'rewarded')),
    target_audience JSONB DEFAULT '{}',

    -- Pricing and budget
    cpm_rate DECIMAL(10, 6) DEFAULT 0, -- Cost per mille (1000 impressions)
    cpc_rate DECIMAL(10, 6) DEFAULT 0, -- Cost per click
    total_budget DECIMAL(10, 2) NOT NULL CHECK (total_budget > 0),
    spent_budget DECIMAL(10, 2) DEFAULT 0 CHECK (spent_budget >= 0),

    -- Performance metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5, 4) GENERATED ALWAYS AS (CASE WHEN impressions > 0 THEN clicks::DECIMAL / impressions ELSE 0 END) STORED,

    -- Campaign status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,

    -- Approval and compliance
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID,
    approved_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CHECK (spent_budget <= total_budget),
    CHECK (start_date <= end_date OR end_date IS NULL)
);

-- Indexes for campaign management
CREATE INDEX idx_ad_campaigns_tenant ON ad_campaigns(tenant_id, created_at DESC);
CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status, created_at DESC);
CREATE INDEX idx_ad_campaigns_performance ON ad_campaigns(spent_budget DESC, ctr DESC);

-- ============================================================================
-- SUBSCRIPTION MANAGEMENT
-- ============================================================================

-- Subscription history (audit trail for tier changes)
CREATE TABLE subscription_history (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Change details
    old_tier VARCHAR(50),
    new_tier VARCHAR(50) NOT NULL,
    reason VARCHAR(255),

    -- Change metadata
    changed_by UUID, -- admin or user who made the change
    automated BOOLEAN DEFAULT FALSE,

    -- Resource changes
    old_cpu_quota INTEGER,
    new_cpu_quota INTEGER,
    old_memory_quota INTEGER,
    new_memory_quota INTEGER,
    old_storage_quota INTEGER,
    new_storage_quota INTEGER,

    -- Cost impact
    price_change DECIMAL(10, 2),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    -- Partitioning support
    PARTITION BY RANGE (created_at)
);

-- Indexes
CREATE INDEX idx_subscription_history_tenant ON subscription_history(tenant_id, created_at DESC);
CREATE INDEX idx_subscription_history_tier ON subscription_history(new_tier, created_at DESC);

-- ============================================================================
-- RECURRING PAYMENTS AND BILLING
-- ============================================================================

-- Recurring payment subscriptions
CREATE TABLE recurring_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Payment details
    payment_method_id VARCHAR(255) NOT NULL, -- Stripe payment method ID
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',

    -- Schedule
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'annually')),
    next_billing_date DATE NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'failed')),

    -- Credits to add
    credits_per_billing DECIMAL(10, 4) NOT NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    cancelled_at TIMESTAMP,

    -- Constraints
    CHECK (next_billing_date >= CURRENT_DATE)
);

-- Indexes
CREATE INDEX idx_recurring_payments_tenant ON recurring_payments(tenant_id, status, next_billing_date);
CREATE INDEX idx_recurring_payments_next_billing ON recurring_payments(status, next_billing_date);

-- ============================================================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update tenant balance after credit transaction
CREATE OR REPLACE FUNCTION update_tenant_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update tenant balance and last activity
    UPDATE tenants
    SET
        credit_balance = NEW.balance_after,
        last_activity_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.tenant_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update tenant balance
DROP TRIGGER IF EXISTS trigger_update_tenant_balance ON credit_transactions;
CREATE TRIGGER trigger_update_tenant_balance
    AFTER INSERT ON credit_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_balance();

-- Function to aggregate daily service usage
CREATE OR REPLACE FUNCTION aggregate_daily_usage()
RETURNS void AS $$
BEGIN
    -- Insert or update daily aggregations
    INSERT INTO service_usage_daily (tenant_id, service_name, date, total_usage, total_cost, usage_count, peak_usage, avg_usage)
    SELECT
        tenant_id,
        metadata->>'service' as service_name,
        DATE(recorded_at) as date,
        SUM(amount) as total_usage,
        SUM(cost) as total_cost,
        COUNT(*) as usage_count,
        MAX(amount) as peak_usage,
        AVG(amount) as avg_usage
    FROM usage_records
    WHERE DATE(recorded_at) = CURRENT_DATE - INTERVAL '1 day'
        AND metadata->>'service' IS NOT NULL
        AND metadata->>'service' != ''
    GROUP BY tenant_id, metadata->>'service', DATE(recorded_at)
    ON CONFLICT (tenant_id, service_name, date)
    DO UPDATE SET
        total_usage = EXCLUDED.total_usage,
        total_cost = EXCLUDED.total_cost,
        usage_count = EXCLUDED.usage_count,
        peak_usage = GREATEST(service_usage_daily.peak_usage, EXCLUDED.peak_usage),
        avg_usage = EXCLUDED.avg_usage,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check and create credit alerts
CREATE OR REPLACE FUNCTION check_credit_alerts()
RETURNS void AS $$
DECLARE
    tenant_record RECORD;
    alert_threshold DECIMAL(10, 4);
BEGIN
    -- Check each active tenant
    FOR tenant_record IN
        SELECT id, credit_balance, minimum_credits,
               CASE
                   WHEN subscription_tier = 'payg' THEN 10.0
                   WHEN subscription_tier = 'personal' THEN 25.0
                   WHEN subscription_tier = 'team' THEN 50.0
                   ELSE 100.0
               END as low_threshold
        FROM tenants
        WHERE status = 'active'
    LOOP
        -- Check for low credits
        IF tenant_record.credit_balance <= tenant_record.low_threshold THEN
            INSERT INTO credit_alerts (
                tenant_id, alert_type, severity, threshold, current_value,
                title, message, status
            ) VALUES (
                tenant_record.id, 'low_credits', 'warning',
                tenant_record.low_threshold, tenant_record.credit_balance,
                'Low Credit Balance',
                format('Your credit balance is running low: %.2f credits remaining. Consider adding more credits to avoid service interruption.', tenant_record.credit_balance),
                'pending'
            )
            ON CONFLICT DO NOTHING; -- Avoid duplicate alerts
        END IF;

        -- Check for depleted credits
        IF tenant_record.credit_balance <= 0 THEN
            INSERT INTO credit_alerts (
                tenant_id, alert_type, severity, current_value,
                title, message, status
            ) VALUES (
                tenant_record.id, 'depleted', 'critical', tenant_record.credit_balance,
                'Credits Depleted',
                'Your credit balance is depleted. Services may be suspended until credits are added.',
                'pending'
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Tenant usage summary (refreshed periodically)
CREATE MATERIALIZED VIEW tenant_usage_summary AS
SELECT
    t.id as tenant_id,
    t.name,
    t.email,
    t.subscription_tier,
    t.credit_balance,
    t.status as tenant_status,

    -- Usage metrics (last 7 days)
    COALESCE(SUM(ur.cost), 0) as total_spent_7days,
    COALESCE(SUM(ar.credits_earned), 0) as total_earned_7days,
    COUNT(DISTINCT DATE(ur.recorded_at)) as active_days_7days,
    COALESCE(AVG(ur.cost), 0) as avg_daily_cost_7days,

    -- Usage metrics (last 30 days)
    COALESCE(SUM(ur30.cost), 0) as total_spent_30days,
    COALESCE(SUM(ar30.credits_earned), 0) as total_earned_30days,
    COUNT(DISTINCT DATE(ur30.recorded_at)) as active_days_30days,
    COALESCE(AVG(ur30.cost), 0) as avg_daily_cost_30days,

    -- Current month metrics
    COALESCE(SUM(ur_month.cost), 0) as total_spent_month,
    COALESCE(SUM(ar_month.credits_earned), 0) as total_earned_month,

    -- Payment metrics
    COUNT(DISTINCT pr.id) as payments_count_30days,
    COALESCE(SUM(pr.amount), 0) as total_payments_30days,

    -- Alert status
    EXISTS(
        SELECT 1 FROM credit_alerts ca
        WHERE ca.tenant_id = t.id
        AND ca.status = 'pending'
        AND ca.created_at >= NOW() - INTERVAL '24 hours'
    ) as has_recent_alerts,

    -- Last activity
    GREATEST(
        MAX(t.last_activity_at),
        MAX(ur.recorded_at),
        MAX(ar.created_at),
        MAX(ct.created_at)
    ) as last_activity_at

FROM tenants t
LEFT JOIN usage_records ur ON t.id = ur.tenant_id
    AND ur.recorded_at >= NOW() - INTERVAL '7 days'
LEFT JOIN usage_records ur30 ON t.id = ur30.tenant_id
    AND ur30.recorded_at >= NOW() - INTERVAL '30 days'
LEFT JOIN usage_records ur_month ON t.id = ur_month.tenant_id
    AND ur_month.recorded_at >= date_trunc('month', CURRENT_DATE)
LEFT JOIN ad_revenue_log ar ON t.id = ar.tenant_id
    AND ar.created_at >= NOW() - INTERVAL '7 days'
LEFT JOIN ad_revenue_log ar30 ON t.id = ar30.tenant_id
    AND ar30.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN ad_revenue_log ar_month ON t.id = ar_month.tenant_id
    AND ar_month.created_at >= date_trunc('month', CURRENT_DATE)
LEFT JOIN credit_transactions ct ON t.id = ct.tenant_id
    AND ct.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN payment_records pr ON t.id = pr.tenant_id
    AND pr.created_at >= NOW() - INTERVAL '30 days'
    AND pr.status = 'completed'
WHERE t.status IN ('active', 'trial')
GROUP BY t.id, t.name, t.email, t.subscription_tier, t.credit_balance, t.status;

-- Index for performance
CREATE UNIQUE INDEX idx_tenant_usage_summary_tenant ON tenant_usage_summary(tenant_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_tenant_usage_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY tenant_usage_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Daily revenue report
CREATE VIEW daily_revenue_report AS
SELECT
    DATE(ct.created_at) as date,
    COUNT(DISTINCT ct.tenant_id) as active_tenants,

    -- Revenue by type
    SUM(CASE WHEN ct.transaction_type = 'purchase' THEN ct.amount ELSE 0 END) as total_purchases,
    SUM(CASE WHEN ct.transaction_type = 'usage' THEN ct.amount ELSE 0 END) as total_usage_charges,
    SUM(CASE WHEN ct.transaction_type = 'ad_revenue' THEN ct.amount ELSE 0 END) as total_ad_revenue,

    -- Payment metrics
    COUNT(DISTINCT pr.id) as payments_count,
    SUM(pr.amount) as total_payment_volume,
    SUM(pr.credits_purchased) as total_credits_sold,

    -- Usage metrics
    COUNT(DISTINCT ur.id) as usage_events,
    SUM(ur.cost) as total_usage_cost,
    AVG(ur.cost) as avg_usage_cost

FROM credit_transactions ct
LEFT JOIN payment_records pr ON ct.payment_id = pr.id
LEFT JOIN usage_records ur ON ct.usage_id = ur.id
WHERE DATE(ct.created_at) >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(ct.created_at)
ORDER BY date DESC;

-- Tenant performance report
CREATE VIEW tenant_performance_report AS
SELECT
    t.id as tenant_id,
    t.name,
    t.subscription_tier,
    t.credit_balance,
    t.created_at as signup_date,

    -- Usage metrics (last 30 days)
    COALESCE(SUM(ur.cost), 0) as usage_cost_30d,
    COUNT(DISTINCT ur.id) as usage_events_30d,
    COALESCE(AVG(ur.cost), 0) as avg_usage_cost_30d,

    -- Payment metrics (last 30 days)
    COUNT(DISTINCT pr.id) as payments_30d,
    COALESCE(SUM(pr.amount), 0) as payment_volume_30d,

    -- Subscription metrics
    COUNT(sh.id) as subscription_changes,
    MAX(sh.created_at) as last_tier_change,

    -- Activity metrics
    GREATEST(
        MAX(t.last_activity_at),
        MAX(ur.recorded_at),
        MAX(pr.created_at)
    ) as last_activity

FROM tenants t
LEFT JOIN usage_records ur ON t.id = ur.tenant_id
    AND ur.recorded_at >= NOW() - INTERVAL '30 days'
LEFT JOIN payment_records pr ON t.id = pr.tenant_id
    AND pr.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN subscription_history sh ON t.id = sh.tenant_id
WHERE t.status = 'active'
GROUP BY t.id, t.name, t.subscription_tier, t.credit_balance, t.created_at
ORDER BY usage_cost_30d DESC;

-- ============================================================================
-- SEED DATA FOR TESTING
-- ============================================================================

-- Sample tenants for development/testing
INSERT INTO tenants (name, email, namespace, subscription_tier, credit_balance, minimum_credits, cpu_quota, memory_quota, storage_quota)
VALUES
    ('Demo User', 'demo@rica.dev', 'tenant-demo', 'payg', 50.0, 10, 500, 1, 5),
    ('Test Company', 'test@company.com', 'tenant-test', 'team', 150.0, 100, 4000, 8, 50),
    ('Acme Corp', 'billing@acme.com', 'tenant-acme', 'personal', 75.0, 50, 2000, 4, 20)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SAMPLE QUERIES FOR COMMON OPERATIONS
-- ============================================================================

/*
-- Get tenant balance and recent activity
SELECT t.name, t.credit_balance, t.subscription_tier,
       (SELECT SUM(amount) FROM credit_transactions WHERE tenant_id = t.id AND created_at >= NOW() - INTERVAL '24 hours') as activity_24h
FROM tenants t WHERE t.id = 'your-tenant-id';

-- Get usage breakdown for a tenant
SELECT resource_type, SUM(amount) as total_usage, SUM(cost) as total_cost
FROM usage_records
WHERE tenant_id = 'your-tenant-id' AND recorded_at >= NOW() - INTERVAL '30 days'
GROUP BY resource_type ORDER BY total_cost DESC;

-- Get low credit alerts
SELECT t.name, t.email, ca.message, ca.created_at
FROM credit_alerts ca
JOIN tenants t ON ca.tenant_id = t.id
WHERE ca.is_read = FALSE AND ca.alert_type = 'low_credits'
ORDER BY ca.created_at DESC;

-- Daily revenue summary
SELECT * FROM daily_revenue_report WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- Tenant performance ranking
SELECT * FROM tenant_performance_report ORDER BY usage_cost_30d DESC LIMIT 10;
*/

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query performance monitoring

-- Set appropriate timeouts and memory settings for production
-- These should be set in postgresql.conf:
-- shared_preload_libraries = 'pg_stat_statements'
-- work_mem = '256MB'
-- maintenance_work_mem = '512MB'
-- effective_cache_size = '2GB'
-- random_page_cost = 1.5
-- effective_io_concurrency = 200

-- ============================================================================
-- MAINTENANCE AND MONITORING
-- ============================================================================

/*
-- Regular maintenance tasks (run via cron or pg_cron):

-- Daily: Aggregate usage data
SELECT aggregate_daily_usage();

-- Daily: Check for credit alerts
SELECT check_credit_alerts();

-- Hourly: Refresh materialized views
SELECT refresh_tenant_usage_summary();

-- Weekly: Clean old data (adjust retention as needed)
DELETE FROM usage_records WHERE recorded_at < NOW() - INTERVAL '6 months';
DELETE FROM credit_transactions WHERE created_at < NOW() - INTERVAL '2 years';
DELETE FROM credit_alerts WHERE created_at < NOW() - INTERVAL '3 months' AND status = 'acknowledged';

-- Monthly: Vacuum and analyze
VACUUM ANALYZE usage_records;
VACUUM ANALYZE credit_transactions;
VACUUM ANALYZE tenants;

-- Partition management (for very high volume)
-- Add new partitions monthly for usage_records and credit_transactions
*/

-- ============================================================================
-- SECURITY AND COMPLIANCE
-- ============================================================================

-- Row Level Security (RLS) can be enabled for multi-tenant data isolation
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant data access
/*
CREATE POLICY tenant_isolation ON tenants
    FOR ALL USING (auth.jwt() ->> 'tenant_id' = id::text);

CREATE POLICY tenant_usage_access ON usage_records
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        )
    );
*/

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tenants IS 'Core tenant registry with subscription and quota management';
COMMENT ON TABLE usage_records IS 'Detailed usage tracking for billing and analytics';
COMMENT ON TABLE credit_transactions IS 'Complete audit trail of all credit movements';
COMMENT ON TABLE payment_records IS 'Payment gateway integration and transaction records';
COMMENT ON TABLE ad_revenue_log IS 'Ad-based credit earning for monetization';
COMMENT ON TABLE credit_alerts IS 'User notifications for credit events and thresholds';
COMMENT ON TABLE subscription_history IS 'Audit trail for subscription tier changes';

COMMENT ON FUNCTION aggregate_daily_usage() IS 'Aggregates daily usage for analytics and reporting';
COMMENT ON FUNCTION check_credit_alerts() IS 'Creates alerts for low credit and usage thresholds';
COMMENT ON MATERIALIZED VIEW tenant_usage_summary IS 'Cached tenant metrics for dashboard and reporting';

-- ============================================================================
-- DEPLOYMENT NOTES
-- ============================================================================

/*
Deployment Checklist:

1. Create database and run this schema
2. Set up partitioning for usage_records and credit_transactions
3. Configure pg_stat_statements for query monitoring
4. Set up automated maintenance jobs
5. Configure RLS policies for multi-tenant security
6. Set up monitoring and alerting for key metrics
7. Configure backup and disaster recovery
8. Set up read replicas for analytics queries (optional)

Production Settings:
- Increase work_mem and maintenance_work_mem
- Enable query result caching
- Set up connection pooling (pgbouncer)
- Configure WAL archiving for PITR
- Set up automated failover

Monitoring:
- Track slow queries with pg_stat_statements
- Monitor table bloat and vacuum frequency
- Alert on connection pool exhaustion
- Monitor replication lag (if using replicas)
- Track credit balance distributions and alerts
*/
