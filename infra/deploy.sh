#!/bin/bash
set -e

BUCKET_NAME=uk-student-loan-hell
AWS_PROFILE=personal

# Get CloudFront distribution ID from stack
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name uk-student-loan-hell \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text \
  --profile $AWS_PROFILE)

echo "Building..."
npm run build

echo "Uploading to s3://$BUCKET_NAME/uk-student-loan-hell/..."
aws s3 sync dist/ s3://$BUCKET_NAME/uk-student-loan-hell/ --delete --profile $AWS_PROFILE

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/uk-student-loan-hell/*" --profile $AWS_PROFILE

echo "Done! https://jeevancyriac.com/uk-student-loan-hell"
