-- Vircadia Ads System Database Schema
-- This file initializes the database tables for the ads monetization system

-- Create ads_campaigns table
CREATE TABLE IF NOT EXISTS ads_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    advertiser_id UUID NOT NULL,
    advertiser_name VARCHAR(255),
    budget DECIMAL(10,2) DEFAULT 0,
    spent DECIMAL(10,2) DEFAULT 0,
    cpm DECIMAL(5,2) DEFAULT 5.00,
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    targeting JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ads_placements table
CREATE TABLE IF NOT EXISTS ads_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ads_campaigns(id) ON DELETE CASCADE,
    world_id UUID NOT NULL,
    world_creator_id UUID NOT NULL,
    placement_type VARCHAR(50) DEFAULT 'billboard',
    position JSONB DEFAULT '{}',
    dimensions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ads_impressions table
CREATE TABLE IF NOT EXISTS ads_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID REFERENCES ads_placements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    session_id VARCHAR(255),
    impression_type VARCHAR(50) DEFAULT 'view',
    duration_seconds INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ads_revenue table
CREATE TABLE IF NOT EXISTS ads_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_creator_id UUID NOT NULL,
    world_id UUID NOT NULL,
    campaign_id UUID REFERENCES ads_campaigns(id) ON DELETE CASCADE,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    platform_share DECIMAL(10,2) DEFAULT 0,
    creator_share DECIMAL(10,2) DEFAULT 0,
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ads_payouts table
CREATE TABLE IF NOT EXISTS ads_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payout_method VARCHAR(50) DEFAULT 'credit_balance',
    transaction_id VARCHAR(255),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Create world_sessions table for analytics
CREATE TABLE IF NOT EXISTS world_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_id UUID NOT NULL,
    user_id UUID NOT NULL,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    peak_hour_bonus BOOLEAN DEFAULT false,
    weekend_bonus BOOLEAN DEFAULT false,
    device_type VARCHAR(50),
    location_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create world_analytics table
CREATE TABLE IF NOT EXISTS world_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_id UUID NOT NULL,
    date_recorded DATE DEFAULT CURRENT_DATE,
    total_sessions INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    total_duration_hours DECIMAL(10,2) DEFAULT 0,
    avg_session_duration DECIMAL(8,2) DEFAULT 0,
    peak_concurrent_users INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    monetization_score DECIMAL(5,2) DEFAULT 0,
    revenue_potential DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(world_id, date_recorded)
);

-- Create monetization_settings table
CREATE TABLE IF NOT EXISTS monetization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_id UUID NOT NULL,
    ads_enabled BOOLEAN DEFAULT false,
    max_ads_per_session INTEGER DEFAULT 3,
    ad_frequency_seconds INTEGER DEFAULT 300,
    min_user_threshold INTEGER DEFAULT 5,
    revenue_share_percent DECIMAL(5,2) DEFAULT 70.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_campaigns_advertiser ON ads_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ads_placements_world ON ads_placements(world_id);
CREATE INDEX IF NOT EXISTS idx_ads_impressions_placement ON ads_impressions(placement_id);
CREATE INDEX IF NOT EXISTS idx_ads_revenue_creator ON ads_revenue(world_creator_id);
CREATE INDEX IF NOT EXISTS idx_ads_revenue_date ON ads_revenue(date_recorded);
CREATE INDEX IF NOT EXISTS idx_world_sessions_world ON world_sessions(world_id);
CREATE INDEX IF NOT EXISTS idx_world_sessions_user ON world_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_world_sessions_start ON world_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_world_analytics_world_date ON world_analytics(world_id, date_recorded);
CREATE INDEX IF NOT EXISTS idx_monetization_settings_world ON monetization_settings(world_id);

-- Insert sample ad campaigns for testing
-- INSERT INTO ads_campaigns (name, advertiser_id, advertiser_name, budget, cpm) VALUES
-- ('Brand Awareness Campaign', '550e8400-e29b-41d4-a716-446655440000', 'TechCorp Inc', 1000.00, 5.00),
-- ('Product Launch Ads', '550e8400-e29b-41d4-a716-446655440001', 'StartupXYZ', 500.00, 7.50);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_monetization_settings_updated_at BEFORE UPDATE ON monetization_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
