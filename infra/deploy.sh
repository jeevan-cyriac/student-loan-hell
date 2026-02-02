#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"

echo "Building..."
npm run build

echo "Uploading to s3://$S3_BUCKET$SITE_PATH/..."
aws s3 sync dist/ s3://$S3_BUCKET$SITE_PATH/ --delete --profile $AWS_PROFILE

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "$SITE_PATH/*" --profile $AWS_PROFILE > /dev/null

echo "Done! https://jeevancyriac.com$SITE_PATH"
