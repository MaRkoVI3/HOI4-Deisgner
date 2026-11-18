# GeneralStaff Terraform Infrastructure

This directory contains the Terraform configuration for deploying the GeneralStaff application infrastructure on AWS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Route53                                 │
│                    (DNS + ACM Cert)                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Load Balancer                    │
│                  (HTTPS + WAF ready)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                   ┌─────────────┐
    │  ECS API    │                   │  ECS Web    │
    │  Service    │                   │  Service    │
    │ (Fargate)   │                   │ (Fargate)   │
    └──────┬──────┘                   └──────┬──────┘
           │                               │
           └───────────────┬───────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                   ┌─────────────┐
    │   RDS       │                   │ ElastiCache │
    │ PostgreSQL  │                   │    Redis    │
    └─────────────┘                   └─────────────┘
```

## Resources Created

- **VPC** with public, private, and database subnets across 3 AZs
- **NAT Gateways** (1 for dev/staging, 3 for prod)
- **Application Load Balancer** with HTTPS termination
- **ECS Fargate Cluster** with API and Web services
- **RDS PostgreSQL** with encryption, backups, and monitoring
- **ElastiCache Redis** with encryption in transit and at rest
- **Route53 Records** for API and Web domains
- **ACM Certificate** (auto-created via DNS validation if not provided)
- **IAM Roles** for ECS tasks, execution, and autoscaling
- **CloudWatch Log Groups** for all services
- **CloudWatch Alarms** for CPU, memory, and error rates
- **SNS Topic** for alert notifications

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.5.0 installed
3. **Route53 Hosted Zone** for your domain
4. **S3 Bucket** for Terraform state (create manually first)
5. **DynamoDB Table** for state locking (create manually first)

### State Backend Setup

```bash
# Create S3 bucket for state
aws s3 mb s3://generalstaff-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket generalstaff-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket generalstaff-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Create terraform.tfvars

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 3. Deploy Dev Environment

```bash
terraform apply -var-file=env/dev.tfvars
```

### 4. Deploy Staging

```bash
terraform apply -var-file=env/staging.tfvars
```

### 5. Deploy Production

```bash
terraform apply -var-file=env/prod.tfvars
```

## Environment-Specific Configuration

Each environment has its own `.tfvars` file in `env/`:

| Setting | Dev | Staging | Prod |
|---------|-----|---------|------|
| DB Instance | db.t3.micro | db.t3.small | db.r6g.large |
| Redis Nodes | 1 | 2 | 3 |
| ECS CPU | 256 | 512 | 1024 |
| ECS Memory | 512 | 1024 | 2048 |
| Desired Count | 1 | 2 | 3 |
| Max Capacity | 3 | 5 | 20 |
| Deletion Protection | ❌ | ✅ | ✅ |
| NAT Gateways | 1 | 1 | 3 |

## Secrets Management

**Never store secrets in `.tfvars` files!**

For production, use AWS Systems Manager Parameter Store:

```bash
# Store database password
aws ssm put-parameter \
  --name "/generalstaff/prod/db_password" \
  --value "your-secure-password" \
  --type "SecureString"

# Store Redis auth token
aws ssm put-parameter \
  --name "/generalstaff/prod/redis_auth_token" \
  --value "your-redis-token" \
  --type "SecureString"

# Store JWT secret
aws ssm put-parameter \
  --name "/generalstaff/prod/jwt_secret" \
  --value "your-jwt-secret" \
  --type "SecureString"
```

Then reference them in your task definition or use the AWS Secrets Manager integration.

## Container Images

Build and push your Docker images to Amazon ECR:

```bash
# Create ECR repositories
aws ecr create-repository --repository-name generalstaff/api
aws ecr create-repository --repository-name generalstaff/web

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t generalstaff/api:latest ./apps/api
docker tag generalstaff/api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/generalstaff/api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/generalstaff/api:latest

docker build -t generalstaff/web:latest ./apps/web
docker tag generalstaff/web:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/generalstaff/web:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/generalstaff/web:latest
```

Update `container_image_api` and `container_image_web` in your tfvars.

## SSL Certificate

### Option 1: Use Existing Certificate (Recommended for Prod)

1. Request certificate in ACM (us-east-1) for `*.yourdomain.com` and `yourdomain.com`
2. Validate via DNS
3. Set `certificate_arn` in tfvars

### Option 2: Auto-Create (Dev/Staging)

Leave `certificate_arn` empty. Terraform will:
1. Create ACM certificate
2. Create Route53 validation records
3. Wait for validation

## Updating Services

To deploy new container images:

```bash
# Update task definition with new image
terraform apply -var-file=env/prod.tfvars \
  -var="container_image_api=123456789012.dkr.ecr.us-east-1.amazonaws.com/generalstaff/api:v1.1.0" \
  -var="container_image_web=123456789012.dkr.ecr.us-east-1.amazonaws.com/generalstaff/web:v1.1.0"
```

Or use ECS CLI / GitHub Actions for CI/CD.

## Monitoring

CloudWatch alarms are created for:
- ECS service CPU > 80%
- ECS service Memory > 80%
- RDS CPU > 80%
- Redis Memory > 80%
- ALB 5xx errors > 10/min

Subscribe to the SNS topic for email notifications.

## Destruction

To destroy an environment:

```bash
terraform destroy -var-file=env/dev.tfvars
```

**Warning**: This will delete all data including databases!

## File Structure

```
terraform/
├── main.tf                 # Main configuration
├── variables.tf            # Variable definitions
├── terraform.tfvars.example # Example variables file
├── env/
│   ├── dev.tfvars         # Dev environment
│   ├── staging.tfvars     # Staging environment
│   └── prod.tfvars        # Production environment
└── README.md              # This file
```

## Troubleshooting

### State Lock Issues

```bash
# Force unlock if stuck
terraform force-unlock <LOCK_ID>
```

### Certificate Validation Stuck

Check Route53 records exist and are correct:
```bash
aws route53 list-resource-record-sets --hosted-zone-id <ZONE_ID>
```

### ECS Service Not Starting

Check CloudWatch Logs:
```bash
aws logs tail /ecs/generalstaff-prod/api --follow
aws logs tail /ecs/generalstaff-prod/web --follow
```

## Security Best Practices

1. ✅ VPC with private subnets for compute
2. ✅ Database in isolated subnets
3. ✅ Encryption at rest (RDS, Redis, S3)
4. ✅ Encryption in transit (TLS everywhere)
5. ✅ IAM least privilege roles
6. ✅ Security groups restricting traffic
7. ⚠️ Restrict `allowed_cidr_blocks` in production
8. ⚠️ Use SSM Parameter Store for secrets
9. ⚠️ Enable WAF on ALB for production
10. ⚠️ Enable GuardDuty and Security Hub

## License

Internal use only.