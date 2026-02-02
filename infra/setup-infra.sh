#!/bin/bash
# Setup infrastructure for uk-student-loan-hell
# Adds S3 bucket + origin to existing CloudFront distribution
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "=== UK Student Loan Hell - Infra Setup ==="

# 1. Create S3 bucket
echo "[1/4] Creating S3 bucket: $S3_BUCKET"
aws s3api create-bucket \
  --bucket $S3_BUCKET \
  --region $AWS_REGION \
  --profile $AWS_PROFILE 2>/dev/null || echo "Bucket may already exist"

aws s3api put-public-access-block \
  --bucket $S3_BUCKET \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
  --profile $AWS_PROFILE

# 2. Create Origin Access Control
echo "[2/4] Creating Origin Access Control"
OAC_NAME="${S3_BUCKET}-oac"
OAC_ID=$(aws cloudfront create-origin-access-control \
  --origin-access-control-config "{
    \"Name\": \"$OAC_NAME\",
    \"SigningProtocol\": \"sigv4\",
    \"SigningBehavior\": \"always\",
    \"OriginAccessControlOriginType\": \"s3\"
  }" \
  --profile $AWS_PROFILE \
  --query 'OriginAccessControl.Id' \
  --output text 2>/dev/null || \
  aws cloudfront list-origin-access-controls --profile $AWS_PROFILE \
    --query "OriginAccessControlList.Items[?Name=='$OAC_NAME'].Id" \
    --output text)

echo "   OAC ID: $OAC_ID"

# 3. Update S3 bucket policy
echo "[3/4] Updating S3 bucket policy"
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$S3_BUCKET/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::$AWS_ACCOUNT_ID:distribution/$CLOUDFRONT_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $S3_BUCKET \
  --policy file:///tmp/bucket-policy.json \
  --profile $AWS_PROFILE

# 4. Update CloudFront distribution
echo "[4/4] Updating CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"

# Get current config
aws cloudfront get-distribution-config \
  --id $CLOUDFRONT_DISTRIBUTION_ID \
  --profile $AWS_PROFILE > /tmp/cf-config.json

ETAG=$(jq -r '.ETag' /tmp/cf-config.json)

# Add new origin and cache behavior
jq --arg oac "$OAC_ID" --arg bucket "$S3_BUCKET" --arg region "$AWS_REGION" --arg path "$SITE_PATH" '.DistributionConfig |
  # Add new origin
  .Origins.Items += [{
    "Id": "S3-uk-student-loan-hell",
    "DomainName": ($bucket + ".s3." + $region + ".amazonaws.com"),
    "OriginPath": "",
    "CustomHeaders": {"Quantity": 0},
    "S3OriginConfig": {"OriginAccessIdentity": ""},
    "OriginAccessControlId": $oac,
    "ConnectionAttempts": 3,
    "ConnectionTimeout": 10,
    "OriginShield": {"Enabled": false}
  }] |
  .Origins.Quantity = (.Origins.Items | length) |
  # Add cache behavior for path
  .CacheBehaviors.Items = [{
    "PathPattern": ($path + "/*"),
    "TargetOriginId": "S3-uk-student-loan-hell",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true,
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]}
    },
    "SmoothStreaming": false,
    "FunctionAssociations": {"Quantity": 0},
    "LambdaFunctionAssociations": {"Quantity": 0},
    "FieldLevelEncryptionId": "",
    "TrustedSigners": {"Enabled": false, "Quantity": 0},
    "TrustedKeyGroups": {"Enabled": false, "Quantity": 0}
  }] + (.CacheBehaviors.Items // []) |
  .CacheBehaviors.Quantity = (.CacheBehaviors.Items | length)
' /tmp/cf-config.json > /tmp/cf-update.json

aws cloudfront update-distribution \
  --id $CLOUDFRONT_DISTRIBUTION_ID \
  --if-match $ETAG \
  --distribution-config file:///tmp/cf-update.json \
  --profile $AWS_PROFILE > /dev/null

echo ""
echo "=== Done! ==="
echo "S3 Bucket: $S3_BUCKET"
echo "CloudFront: $CLOUDFRONT_DISTRIBUTION_ID"
echo "URL: https://jeevancyriac.com$SITE_PATH"
echo ""
echo "Next: run ./infra/deploy.sh to deploy the site"
