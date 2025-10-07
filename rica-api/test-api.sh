#!/bin/bash

# Rica API Test Script
# Tests the multi-tenancy API endpoints

API_URL="http://localhost:3001"
API_KEY="${API_KEY:-changeme-in-dev}"
USER_ID="test-user-123"
USER_EMAIL="test@rica.example.com"

echo "🧪 Testing Rica Multi-Tenancy API"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/api/health")
echo "Response: $HEALTH_RESPONSE"
echo ""

# Test 2: Provision Tenant
echo "2️⃣  Testing Tenant Provisioning..."
PROVISION_RESPONSE=$(curl -s -X POST "$API_URL/api/tenants/provision" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "x-user-email: $USER_EMAIL" \
  -d '{
    "subscriptionTier": "pay-as-you-go",
    "userCredits": 100
  }')
echo "Response: $PROVISION_RESPONSE"

# Extract tenant ID from response
TENANT_ID=$(echo $PROVISION_RESPONSE | grep -o '"tenantId":"[^"]*"' | cut -d'"' -f4)
echo "Tenant ID: $TENANT_ID"
echo ""

if [ -z "$TENANT_ID" ]; then
  echo "❌ Failed to provision tenant. Stopping tests."
  exit 1
fi

# Test 3: Get Tenant Info
echo "3️⃣  Testing Get Tenant Info..."
TENANT_INFO=$(curl -s -H "x-api-key: $API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "x-user-email: $USER_EMAIL" \
  "$API_URL/api/tenants/$TENANT_ID")
echo "Response: $TENANT_INFO"
echo ""

# Test 4: Get Tenant Status
echo "4️⃣  Testing Get Tenant Status..."
TENANT_STATUS=$(curl -s -H "x-api-key: $API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "x-user-email: $USER_EMAIL" \
  "$API_URL/api/tenants/$TENANT_ID/status")
echo "Response: $TENANT_STATUS"
echo ""

# Test 5: Get Credit Usage
echo "5️⃣  Testing Get Credit Usage..."
CREDIT_USAGE=$(curl -s -H "x-api-key: $API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "x-user-email: $USER_EMAIL" \
  "$API_URL/api/tenants/$TENANT_ID/credits")
echo "Response: $CREDIT_USAGE"
echo ""

# Test 6: Get Estimated Cost
echo "6️⃣  Testing Get Estimated Cost..."
ESTIMATED_COST=$(curl -s -H "x-api-key: $API_KEY" \
  "$API_URL/api/tenants/tier/pay-as-you-go/cost")
echo "Response: $ESTIMATED_COST"
echo ""

# Test 7: List All Tenants
echo "7️⃣  Testing List All Tenants..."
ALL_TENANTS=$(curl -s -H "x-api-key: $API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "x-user-email: $USER_EMAIL" \
  "$API_URL/api/tenants")
echo "Response: $ALL_TENANTS"
echo ""

# Test 8: Update Tier
echo "8️⃣  Testing Update Subscription Tier..."
UPDATE_TIER=$(curl -s -X PUT "$API_URL/api/tenants/$TENANT_ID/tier" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "x-user-email: $USER_EMAIL" \
  -d '{
    "newTier": "personal",
    "userCredits": 200
  }')
echo "Response: $UPDATE_TIER"
echo ""

# Test 9: Deprovision Tenant
echo "9️⃣  Testing Tenant Deprovisioning..."
DEPROVISION_RESPONSE=$(curl -s -X DELETE "$API_URL/api/tenants/$TENANT_ID" \
  -H "x-api-key: $API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "x-user-email: $USER_EMAIL")
echo "Response: $DEPROVISION_RESPONSE"
echo ""

echo "✅ All tests completed!"
echo ""
echo "Note: Some tests may fail if Kubernetes is not configured."
echo "Check the API logs for detailed error messages."
