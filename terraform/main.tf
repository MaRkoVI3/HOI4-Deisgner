# GeneralStaff Infrastructure - Terraform Configuration
# Supports dev, staging, prod environments

#############################
# Provider & Backend
#############################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket         = "generalstaff-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "generalstaff"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

#############################
# Variables
#############################

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "db_subnet_cidrs" {
  description = "CIDR blocks for database subnets"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
}

variable "domain_name" {
  description = "Root domain name for Route53"
  type        = string
  default     = "generalstaff.example.com"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS (must be in us-east-1 for CloudFront/ALB)"
  type        = string
  default     = ""
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "RDS max allocated storage for autoscaling"
  type        = number
  default     = 100
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_nodes" {
  description = "Number of Redis nodes"
  type        = number
  default     = 1
}

variable "ecs_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "ECS task memory in MiB"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "ecs_max_capacity" {
  description = "Maximum ECS tasks for autoscaling"
  type        = number
  default     = 10
}

variable "container_image_api" {
  description = "Docker image URI for API service"
  type        = string
  default     = ""
}

variable "container_image_web" {
  description = "Docker image URI for Web service"
  type        = string
  default     = ""
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database master password (use SSM Parameter Store in production)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "redis_auth_token" {
  description = "Redis auth token (use SSM Parameter Store in production)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for stateful resources"
  type        = bool
  default     = false
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access ALB"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

#############################
# Data Sources
#############################

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_route53_zone" "main" {
  name = var.domain_name
}

#############################
# Random Resources (for unique names)
#############################

resource "random_id" "suffix" {
  byte_length = 4
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

resource "random_password" "redis_auth" {
  length  = 32
  special = false
}

#############################
# VPC & Networking
#############################

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "generalstaff-${var.environment}"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "generalstaff-${var.environment}-igw"
  }
}

resource "aws_nat_gateway" "main" {
  count = var.environment == "prod" ? 3 : 1

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "generalstaff-${var.environment}-nat-${count.index}"
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "nat" {
  count = var.environment == "prod" ? 3 : 1

  domain = "vpc"
  tags = {
    Name = "generalstaff-${var.environment}-nat-eip-${count.index}"
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "generalstaff-${var.environment}-public-${count.index}"
    Type = "public"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "generalstaff-${var.environment}-private-${count.index}"
    Type = "private"
  }
}

resource "aws_subnet" "db" {
  count             = length(var.db_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.db_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "generalstaff-${var.environment}-db-${count.index}"
    Type = "database"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "generalstaff-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  count  = var.environment == "prod" ? 3 : 1
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "generalstaff-${var.environment}-private-rt-${count.index}"
  }
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index % length(aws_route_table.private)].id
}

resource "aws_db_subnet_group" "main" {
  name       = "generalstaff-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.db[*].id

  tags = {
    Name = "generalstaff-${var.environment}-db-subnet-group"
  }
}

#############################
# Security Groups
#############################

resource "aws_security_group" "alb" {
  name        = "generalstaff-${var.environment}-alb"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.allowed_cidr_blocks
    content {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
      description = "HTTPS from ${ingress.value}"
    }
  }

  dynamic "ingress_http" {
    for_each = var.allowed_cidr_blocks
    content {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = [ingress_http.value]
      description = "HTTP redirect from ${ingress_http.value}"
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "generalstaff-${var.environment}-alb-sg"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "generalstaff-${var.environment}-ecs-tasks"
  description = "Security group for ECS Fargate tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "HTTP from ALB"
  }

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Web from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "generalstaff-${var.environment}-ecs-tasks-sg"
  }
}

resource "aws_security_group" "rds" {
  name        = "generalstaff-${var.environment}-rds"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
    description     = "PostgreSQL from ECS tasks"
  }

  tags = {
    Name = "generalstaff-${var.environment}-rds-sg"
  }
}

resource "aws_security_group" "redis" {
  name        = "generalstaff-${var.environment}-redis"
  description = "Security group for ElastiCache Redis"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
    description     = "Redis from ECS tasks"
  }

  tags = {
    Name = "generalstaff-${var.environment}-redis-sg"
  }
}

#############################
# RDS PostgreSQL
#############################

resource "aws_db_instance" "main" {
  identifier             = "generalstaff-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16.3"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = var.db_max_allocated_storage
  storage_encrypted      = true
  storage_type           = "gp3"
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  username               = var.db_username
  password               = var.db_password != "" ? var.db_password : random_password.db_password.result
  database_name          = "generalstaff"
  port                   = 5432

  backup_retention_period = var.environment == "prod" ? 30 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  deletion_protection = var.enable_deletion_protection || var.environment == "prod"
  skip_final_snapshot = var.environment != "prod"

  performance_insights_enabled = var.environment == "prod"
  monitoring_interval          = var.environment == "prod" ? 60 : 0

  tags = {
    Name = "generalstaff-${var.environment}-db"
  }
}

#############################
# ElastiCache Redis
#############################

resource "aws_elasticache_subnet_group" "main" {
  name       = "generalstaff-${var.environment}-redis-subnet"
  subnet_ids = aws_subnet.db[*].id
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "generalstaff-${var.environment}-redis"
  description                = "Redis cluster for GeneralStaff ${var.environment}"
  engine                     = "redis"
  engine_version             = "7.1"
  node_type                  = var.redis_node_type
  number_cache_clusters      = var.redis_num_nodes
  port                       = 6379
  parameter_group_name       = "default.redis7"
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.redis.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token != "" ? var.redis_auth_token : random_password.redis_auth.result

  automatic_failover_enabled = var.environment == "prod"
  multi_az_enabled           = var.environment == "prod"

  snapshot_retention_limit = var.environment == "prod" ? 30 : 7
  snapshot_window          = "03:00-04:00"

  tags = {
    Name = "generalstaff-${var.environment}-redis"
  }
}

#############################
# ECS Cluster
#############################

resource "aws_ecs_cluster" "main" {
  name = "generalstaff-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"

      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs_exec.name
      }
    }
  }

  tags = {
    Name = "generalstaff-${var.environment}-ecs"
  }
}

#############################
# CloudWatch Log Groups
#############################

resource "aws_cloudwatch_log_group" "ecs_api" {
  name              = "/ecs/generalstaff-${var.environment}/api"
  retention_in_days = var.environment == "prod" ? 90 : 30
}

resource "aws_cloudwatch_log_group" "ecs_web" {
  name              = "/ecs/generalstaff-${var.environment}/web"
  retention_in_days = var.environment == "prod" ? 90 : 30
}

resource "aws_cloudwatch_log_group" "ecs_exec" {
  name              = "/ecs/generalstaff-${var.environment}/exec"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "alb" {
  name              = "/aws/alb/generalstaff-${var.environment}"
  retention_in_days = var.environment == "prod" ? 90 : 30
}

#############################
# IAM Roles
#############################

resource "aws_iam_role" "ecs_task_execution" {
  name = "generalstaff-${var.environment}-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name = "generalstaff-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "ecs_task_secrets" {
  name = "generalstaff-${var.environment}-ecs-task-secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:generalstaff/${var.environment}/*",
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/generalstaff/${var.environment}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          aws_cloudwatch_log_group.ecs_api.arn,
          aws_cloudwatch_log_group.ecs_web.arn,
          aws_cloudwatch_log_group.ecs_exec.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_secrets" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.ecs_task_secrets.arn
}

resource "aws_iam_role" "ecs_autoscaling" {
  name = "generalstaff-${var.environment}-ecs-autoscaling"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_autoscaling" {
  role       = aws_iam_role.ecs_autoscaling.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceAutoscaleRole"
}

data "aws_caller_identity" "current" {}

#############################
# Application Load Balancer
#############################

resource "aws_lb" "main" {
  name               = "generalstaff-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  enable_deletion_protection = var.environment == "prod"

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }

  tags = {
    Name = "generalstaff-${var.environment}-alb"
  }
}

resource "aws_s3_bucket" "alb_logs" {
  bucket = "generalstaff-${var.environment}-alb-logs-${random_id.suffix.hex}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_lb_target_group" "api" {
  name        = "generalstaff-${var.environment}-api"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name = "generalstaff-${var.environment}-api-tg"
  }
}

resource "aws_lb_target_group" "web" {
  name        = "generalstaff-${var.environment}-web"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name = "generalstaff-${var.environment}-web-tg"
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  certificate_arn   = var.certificate_arn != "" ? var.certificate_arn : aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

#############################
# ACM Certificate (if not provided)
#############################

resource "aws_acm_certificate" "main" {
  count = var.certificate_arn == "" ? 1 : 0

  domain_name       = "*.${var.domain_name}"
  validation_method = "DNS"

  subject_alternative_names = [var.domain_name]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "main" {
  count = var.certificate_arn == "" ? 1 : 0

  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

resource "aws_route53_record" "cert_validation" {
  count = var.certificate_arn == "" ? length(aws_acm_certificate.main[0].domain_validation_options) : 0

  zone_id = data.aws_route53_zone.main.zone_id
  name    = aws_acm_certificate.main[0].domain_validation_options[count.index].resource_record_name
  type    = aws_acm_certificate.main[0].domain_validation_options[count.index].resource_record_type
  records = [aws_acm_certificate.main[0].domain_validation_options[count.index].resource_record_value]
  ttl     = 60
}

#############################
# Route53 Records
#############################

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [aws_lb.main.dns_name]
}

resource "aws_route53_record" "web" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.domain_name]
}

#############################
# ECS Task Definitions
#############################

data "aws_ecs_task_definition" "api" {
  task_definition_arn = aws_ecs_task_definition.api.arn
}

data "aws_ecs_task_definition" "web" {
  task_definition_arn = aws_ecs_task_definition.web.arn
}

resource "aws_ecs_task_definition" "api" {
  family                   = "generalstaff-${var.environment}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_cpu
  memory                   = var.ecs_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = var.container_image_api != "" ? var.container_image_api : "generalstaff/api:latest"
      cpu       = var.ecs_cpu
      memory    = var.ecs_memory
      essential = true

      portMappings = [{
        containerPort = 8080
        protocol      = "tcp"
      }]

      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "PORT", value = "8080" },
        { name = "DATABASE_URL", value = "postgresql://${var.db_username}:${var.db_password != "" ? var.db_password : random_password.db_password.result}@${aws_db_instance.main.endpoint}/generalstaff?sslmode=require" },
        { name = "REDIS_URL", value = "redis://:${var.redis_auth_token != "" ? var.redis_auth_token : random_password.redis_auth.result}@${aws_elasticache_replication_group.main.primary_endpoint_address}:6379" }
      ]

      secrets = [
        { name = "JWT_SECRET", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:generalstaff/${var.environment}/jwt-secret" },
        { name = "API_KEYS", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:generalstaff/${var.environment}/api-keys" }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_api.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command  = ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
        interval = 30
        timeout  = 10
        retries  = 3
        startPeriod = 60
      }
    }
  ])

  runtime_platform = {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}

resource "aws_ecs_task_definition" "web" {
  family                   = "generalstaff-${var.environment}-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_cpu
  memory                   = var.ecs_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = var.container_image_web != "" ? var.container_image_web : "generalstaff/web:latest"
      cpu       = var.ecs_cpu
      memory    = var.ecs_memory
      essential = true

      portMappings = [{
        containerPort = 3000
        protocol      = "tcp"
      }]

      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "PORT", value = "3000" },
        { name = "NEXT_PUBLIC_API_URL", value = "https://api.${var.domain_name}" }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_web.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command  = ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"]
        interval = 30
        timeout  = 10
        retries  = 3
        startPeriod = 30
      }
    }
  ])

  runtime_platform = {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}

#############################
# ECS Services
#############################

resource "aws_ecs_service" "api" {
  name            = "generalstaff-${var.environment}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = aws_subnet.private[*].id
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8080
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  ordering_strategy = "READY"

  tags = {
    Name = "generalstaff-${var.environment}-api-service"
  }
}

resource "aws_ecs_service" "web" {
  name            = "generalstaff-${var.environment}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = aws_subnet.private[*].id
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  ordering_strategy = "READY"

  tags = {
    Name = "generalstaff-${var.environment}-web-service"
  }
}

#############################
# ECS Service Autoscaling
#############################

resource "aws_appautoscaling_target" "api" {
  max_capacity       = var.ecs_max_capacity
  min_capacity       = var.ecs_desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  dynamic "customized_metric_specification" {
    for_each = var.environment == "prod" ? [1] : []
    content {
      metric_name = "CPUUtilization"
      namespace   = "AWS/ECS"
      dimensions = [
        { name = "ClusterName", value = aws_ecs_cluster.main.name },
        { name = "ServiceName", value = aws_ecs_service.api.name }
      ]
      statistic = "Average"
    }
  }
}

resource "aws_appautoscaling_target" "web" {
  max_capacity       = var.ecs_max_capacity
  min_capacity       = var.ecs_desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.web.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "generalstaff-${var.environment}-api-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 300

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "api_memory" {
  name               = "generalstaff-${var.environment}-api-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 300

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "web_cpu" {
  name               = "generalstaff-${var.environment}-web-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.web.resource_id
  scalable_dimension = aws_appautoscaling_target.web.scalable_dimension
  service_namespace  = aws_appautoscaling_target.web.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 300

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "web_memory" {
  name               = "generalstaff-${var.environment}-web-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.web.resource_id
  scalable_dimension = aws_appautoscaling_target.web.scalable_dimension
  service_namespace  = aws_appautoscaling_target.web.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 300

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
  }
}

#############################
# CloudWatch Alarms
#############################

resource "aws_cloudwatch_metric_alarm" "api_high_cpu" {
  alarm_name          = "generalstaff-${var.environment}-api-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "API service CPU utilization is high"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.api.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "web_high_cpu" {
  alarm_name          = "generalstaff-${var.environment}-web-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Web service CPU utilization is high"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.web.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  alarm_name          = "generalstaff-${var.environment}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU utilization is high"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.identifier
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "redis_high_memory" {
  alarm_name          = "generalstaff-${var.environment}-redis-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Redis memory usage is high"

  dimensions = {
    ReplicationGroupId = aws_elasticache_replication_group.main.replication_group_id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "generalstaff-${var.environment}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "ALB returning 5xx errors"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
}

#############################
# SNS Topic for Alerts
#############################

resource "aws_sns_topic" "alerts" {
  name = "generalstaff-${var.environment}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  count = var.environment == "prod" ? 1 : 0

  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "alerts@generalstaff.example.com"
}

#############################
# Outputs
#############################

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "db_subnet_ids" {
  description = "Database subnet IDs"
  value       = aws_subnet.db[*].id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "api_target_group_arn" {
  description = "API target group ARN"
  value       = aws_lb_target_group.api.arn
}

output "web_target_group_arn" {
  description = "Web target group ARN"
  value       = aws_lb_target_group.web.arn
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "api_service_name" {
  description = "API ECS service name"
  value       = aws_ecs_service.api.name
}

output "web_service_name" {
  description = "Web ECS service name"
  value       = aws_ecs_service.web.name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "redis_primary_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

output "db_name" {
  description = "Database name"
  value       = "generalstaff"
}

output "db_username" {
  description = "Database username"
  value       = var.db_username
}

output "api_url" {
  description = "API URL"
  value       = "https://api.${var.domain_name}"
}

output "web_url" {
  description = "Web URL"
  value       = "https://${var.domain_name}"
}