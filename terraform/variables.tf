# GeneralStaff Terraform Variables
# This file documents all input variables with descriptions

#############################
# Provider Configuration
#############################

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

#############################
# Environment Configuration
#############################

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

#############################
# Network Configuration
#############################

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "db_subnet_cidrs" {
  description = "CIDR blocks for database subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
}

#############################
# Domain & SSL
#############################

variable "domain_name" {
  description = "Root domain name for Route53 hosted zone"
  type        = string
  default     = "generalstaff.example.com"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS (must be in us-east-1). If empty, creates a new certificate via DNS validation."
  type        = string
  default     = ""
}

#############################
# Database Configuration
#############################

variable "db_instance_class" {
  description = "RDS instance class (e.g., db.t3.micro, db.t3.small, db.r6g.large)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum storage for RDS autoscaling in GB"
  type        = number
  default     = 100
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database master password. Use SSM Parameter Store in production instead of plain text."
  type        = string
  sensitive   = true
  default     = ""
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for RDS and other stateful resources"
  type        = bool
  default     = false
}

#############################
# Redis Configuration
#############################

variable "redis_node_type" {
  description = "ElastiCache node type (e.g., cache.t3.micro, cache.r6g.large)"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_nodes" {
  description = "Number of Redis nodes (1 for dev, 2+ for prod with replication)"
  type        = number
  default     = 1
}

variable "redis_auth_token" {
  description = "Redis auth token. Use SSM Parameter Store in production."
  type        = string
  sensitive   = true
  default     = ""
}

#############################
# ECS Configuration
#############################

variable "ecs_cpu" {
  description = "CPU units for ECS tasks (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "Memory for ECS tasks in MiB"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks per service"
  type        = number
  default     = 2
}

variable "ecs_max_capacity" {
  description = "Maximum ECS tasks for autoscaling"
  type        = number
  default     = 10
}

variable "container_image_api" {
  description = "Docker image URI for API service (e.g., 123456789.dkr.ecr.region.amazonaws.com/api:tag)"
  type        = string
  default     = ""
}

variable "container_image_web" {
  description = "Docker image URI for Web service (e.g., 123456789.dkr.ecr.region.amazonaws.com/web:tag)"
  type        = string
  default     = ""
}

#############################
# Security
#############################

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the ALB (restrict in production)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}