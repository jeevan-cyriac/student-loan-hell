#!/bin/bash
set -e

# Usage: ./deploy.sh <bucket-name> <distribution-id>

BUCKET_NAME=${1:?Usage: ./deploy.sh <bucket-name> <distribution-id>}
DISTRIBUTION_ID=${2:?Usage: ./deploy.sh <bucket-name> <distribution-id>}
AWS_PROFILE=personal

echo "Building..."
npm run build

echo "Uploading to s3://$BUCKET_NAME..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete --profile $AWS_PROFILE

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --profile $AWS_PROFILE

echo "Done!"
