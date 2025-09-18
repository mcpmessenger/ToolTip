# Setup AWS Resources for Serverless Deployment
Write-Host "🔧 Setting up AWS resources for Serverless deployment..." -ForegroundColor Green

# Get AWS Account ID
Write-Host "Getting AWS Account ID..." -ForegroundColor Yellow
$accountId = aws sts get-caller-identity --query Account --output text
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to get AWS Account ID. Check your AWS credentials." -ForegroundColor Red
    exit 1
}

Write-Host "AWS Account ID: $accountId" -ForegroundColor Cyan

# Create S3 bucket for deployments
$bucketName = "tooltip-backend-deployments-$accountId"
Write-Host "Creating S3 bucket: $bucketName" -ForegroundColor Yellow

aws s3 mb s3://$bucketName --region us-east-1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ S3 bucket created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  S3 bucket might already exist or creation failed" -ForegroundColor Yellow
}

# Enable versioning on the bucket
Write-Host "Enabling versioning on S3 bucket..." -ForegroundColor Yellow
aws s3api put-bucket-versioning --bucket $bucketName --versioning-configuration Status=Enabled

# Set bucket policy for Serverless Framework
Write-Host "Setting bucket policy..." -ForegroundColor Yellow
$bucketPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Sid = "ServerlessDeploymentBucketPolicy"
            Effect = "Allow"
            Principal = @{
                AWS = "arn:aws:iam::$accountId`:root"
            }
            Action = @(
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            )
            Resource = "arn:aws:s3:::$bucketName`/*"
        }
    )
} | ConvertTo-Json -Depth 10

$bucketPolicy | Out-File -FilePath "bucket-policy.json" -Encoding UTF8
aws s3api put-bucket-policy --bucket $bucketName --policy file://bucket-policy.json
Remove-Item "bucket-policy.json" -ErrorAction SilentlyContinue

Write-Host "✅ AWS resources setup complete!" -ForegroundColor Green
Write-Host "📦 S3 Bucket: $bucketName" -ForegroundColor Cyan
Write-Host "🌐 Region: us-east-1" -ForegroundColor Cyan
Write-Host "🚀 You can now run: serverless deploy" -ForegroundColor Green
