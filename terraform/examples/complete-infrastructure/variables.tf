# Variables for Complete Infrastructure Example

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "myapp"
}

variable "domain_name" {
  description = "Domain name for Route53"
  type        = string
  default     = "example.com"
}

variable "hosted_zone_id" {
  description = "Existing hosted zone ID (optional)"
  type        = string
  default     = ""
}

variable "create_hosted_zone" {
  description = "Create hosted zone in Route53"
  type        = bool
  default     = true
}

# VPC Variables
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "database_subnet_cidrs" {
  description = "Database subnet CIDRs"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Enable VPC Flow Logs"
  type        = bool
  default     = false
}

variable "flow_log_destination_arn" {
  description = "Flow logs destination ARN"
  type        = string
  default     = ""
}

variable "enable_vpc_endpoints" {
  description = "Enable VPC Endpoints"
  type        = bool
  default     = true
}

# RDS Variables
variable "db_engine" {
  description = "Database engine"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "15.4"
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage (GB)"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Max allocated storage (GB)"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "myapp"
}

variable "db_master_username" {
  description = "Master username"
  type        = string
  default     = "admin"
}

variable "db_backup_retention_period" {
  description = "Backup retention period (days)"
  type        = number
  default     = 7
}

variable "db_multi_az" {
  description = "Enable Multi-AZ"
  type        = bool
  default     = false
}

variable "db_deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "db_enable_proxy" {
  description = "Enable RDS Proxy"
  type        = bool
  default     = false
}

variable "db_create_read_replica" {
  description = "Create read replicas"
  type        = bool
  default     = false
}

variable "db_read_replica_count" {
  description = "Number of read replicas"
  type        = number
  default     = 1
}

variable "db_performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = true
}

variable "db_monitoring_interval" {
  description = "Enhanced monitoring interval"
  type        = number
  default     = 0
}

# ALB Variables
variable "alb_internal" {
  description = "Internal ALB"
  type        = bool
  default     = false
}

variable "alb_certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  default     = ""
}

variable "alb_target_port" {
  description = "Target group port"
  type        = number
  default     = 8080
}

variable "alb_target_protocol" {
  description = "Target group protocol"
  type        = string
  default     = "HTTP"
}

variable "alb_health_check_path" {
  description = "Health check path"
  type        = string
  default     = "/health"
}

variable "alb_health_check_matcher" {
  description = "Health check matcher"
  type        = string
  default     = "200"
}

variable "alb_enable_access_logs" {
  description = "Enable access logs"
  type        = bool
  default     = true
}

variable "alb_access_logs_bucket" {
  description = "Access logs bucket"
  type        = string
  default     = ""
}

variable "alb_enable_deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "alb_waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  type        = string
  default     = ""
}

variable "alb_enable_shield_protection" {
  description = "Enable Shield protection"
  type        = bool
  default     = false
}

variable "alb_allowed_cidr_blocks" {
  description = "Allowed CIDR blocks"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ECS Variables
variable "ecs_enable_container_insights" {
  description = "Enable Container Insights"
  type        = bool
  default     = true
}

variable "ecs_enable_execute_command" {
  description = "Enable ECS Exec"
  type        = bool
  default     = true
}

variable "ecs_capacity_providers" {
  description = "Capacity providers"
  type        = list(string)
  default     = ["FARGATE", "FARGATE_SPOT"]
}

variable "ecs_log_retention_days" {
  description = "Log retention days"
  type        = number
  default     = 30
}

variable "ecs_task_cpu" {
  description = "Task CPU"
  type        = string
  default     = "256"
}

variable "ecs_task_memory" {
  description = "Task memory"
  type        = string
  default     = "512"
}

variable "ecs_container_name" {
  description = "Container name"
  type        = string
  default     = "app"
}

variable "ecs_container_image" {
  description = "Container image"
  type        = string
  default     = "nginx:latest"
}

variable "ecs_container_port" {
  description = "Container port"
  type        = number
  default     = 8080
}

variable "ecs_desired_count" {
  description = "Desired task count"
  type        = number
  default     = 2
}

variable "ecs_enable_service_discovery" {
  description = "Enable service discovery"
  type        = bool
  default     = false
}

variable "ecs_service_discovery_namespace_id" {
  description = "Service discovery namespace ID"
  type        = string
  default     = ""
}

variable "ecs_enable_autoscaling" {
  description = "Enable autoscaling"
  type        = bool
  default     = true
}

variable "ecs_min_capacity" {
  description = "Minimum capacity"
  type        = number
  default     = 1
}

variable "ecs_max_capacity" {
  description = "Maximum capacity"
  type        = number
  default     = 10
}

variable "ecs_scale_up_target_value" {
  description = "Scale up target CPU %"
  type        = number
  default     = 70
}

variable "ecs_scale_down_target_value" {
  description = "Scale down target memory %"
  type        = number
  default     = 70
}

# Route53 Variables
variable "route53_enable_dnssec" {
  description = "Enable DNSSEC"
  type        = bool
  default     = false
}
