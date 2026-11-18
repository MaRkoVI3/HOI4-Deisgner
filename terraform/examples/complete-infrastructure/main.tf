# Complete Infrastructure Example
# Demonstrates cross-module references between VPC, RDS, ECS, ALB, and Route53

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "my-terraform-state-bucket"
    key    = "complete-infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# ============================================================
# VPC Module - Foundation for all other modules
# ============================================================
module "vpc" {
  source = "../../../modules/vpc"
  
  name = var.project_name
  
  vpc_cidr = var.vpc_cidr
  
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs
  
  enable_nat_gateway     = var.enable_nat_gateway
  enable_flow_logs       = var.enable_flow_logs
  flow_log_destination_arn = var.flow_log_destination_arn
  enable_vpc_endpoints   = var.enable_vpc_endpoints
  
  common_tags = local.common_tags
}

# ============================================================
# RDS Module - Uses VPC database subnets and security groups
# ============================================================
module "rds" {
  source = "../../../modules/rds"
  
  name = var.project_name
  
  vpc_id = module.vpc.vpc_id
  database_subnet_ids = module.vpc.database_subnet_ids
  
  engine               = var.db_engine
  engine_version       = var.db_engine_version
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  
  database_name = var.db_name
  master_username = var.db_master_username
  
  allowed_security_group_ids = [
    module.ecs.task_execution_role_arn != "" ? "" : "",
    # Will be populated after ECS module creates security groups
  ]
  
  backup_retention_period = var.db_backup_retention_period
  multi_az                = var.db_multi_az
  deletion_protection     = var.db_deletion_protection
  
  enable_proxy = var.db_enable_proxy
  
  create_read_replica = var.db_create_read_replica
  read_replica_count = var.db_read_replica_count
  
  performance_insights_enabled = var.db_performance_insights_enabled
  monitoring_interval = var.db_monitoring_interval
  
  common_tags = local.common_tags
}

# ============================================================
# ALB Module - Uses VPC public subnets
# ============================================================
module "alb" {
  source = "../../../modules/alb"
  
  name = var.project_name
  
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids
  security_group_ids = [module.vpc.vpc_endpoint_security_group_id]
  
  internal = var.alb_internal
  
  enable_http_listener = true
  enable_https_listener = true
  certificate_arn = var.alb_certificate_arn
  
  target_group_port = var.alb_target_port
  target_group_protocol = var.alb_target_protocol
  target_type = "ip"
  
  health_check_path = var.alb_health_check_path
  health_check_matcher = var.alb_health_check_matcher
  
  enable_access_logs = var.alb_enable_access_logs
  access_logs_bucket = var.alb_access_logs_bucket
  
  enable_deletion_protection = var.alb_enable_deletion_protection
  
  waf_web_acl_arn = var.alb_waf_web_acl_arn
  enable_shield_protection = var.alb_enable_shield_protection
  
  create_security_group = true
  allowed_cidr_blocks = var.alb_allowed_cidr_blocks
  
  # Listener rules for path-based routing
  listener_rules = {
    api = {
      listener_type = "https"
      priority = 100
      action_type = "forward"
      target_group_name = "main"
      path_pattern_values = ["/api/*"]
    }
    health = {
      listener_type = "https"
      priority = 200
      action_type = "forward"
      target_group_name = "main"
      path_pattern_values = ["/health"]
    }
    default = {
      listener_type = "https"
      priority = 999
      action_type = "fixed_response"
      fixed_response_status_code = "404"
      fixed_response_message_body = "Not Found"
      fixed_response_content_type = "text/plain"
      path_pattern_values = ["*"]
    }
  }
  
  common_tags = local.common_tags
}

# ============================================================
# ECS Module - Uses VPC private subnets, ALB target group
# ============================================================
module "ecs" {
  source = "../../../modules/ecs"
  
  name = var.project_name
  
  enable_container_insights = var.ecs_enable_container_insights
  enable_execute_command = var.ecs_enable_execute_command
  
  capacity_providers = var.ecs_capacity_providers
  
  create_task_role = true
  task_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt"
        ]
        Resource = "*"
      }
    ]
  })
  
  log_retention_days = var.ecs_log_retention_days
  
  task_cpu = var.ecs_task_cpu
  task_memory = var.ecs_task_memory
  
  container_definitions = [
    {
      name = var.ecs_container_name
      image = var.ecs_container_image
      cpu = var.ecs_task_cpu
      memory = var.ecs_task_memory
      portMappings = [{
        containerPort = var.ecs_container_port
        protocol = "tcp"
      }]
      environment = [
        { name = "DB_HOST", value = module.rds.db_instance_endpoint },
        { name = "DB_PORT", value = tostring(module.rds.db_instance_port) },
        { name = "DB_NAME", value = var.db_name },
        { name = "DB_USER", value = var.db_master_username }
      ]
      secrets = [
        { name = "DB_PASSWORD", valueFrom = module.rds.db_instance_arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = "/ecs/${var.project_name}"
          "awslogs-region" = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:${var.ecs_container_port}/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }
    }
  ]
  
  create_service = true
  desired_count = var.ecs_desired_count
  launch_type = "FARGATE"
  
  subnet_ids = module.vpc.private_subnet_ids
  security_group_ids = [module.alb.alb_security_group_id]
  
  enable_alb = true
  target_group_arn = module.alb.target_group_arn
  container_name = var.ecs_container_name
  container_port = var.ecs_container_port
  
  assign_public_ip = false
  
  enable_service_discovery = var.ecs_enable_service_discovery
  service_discovery_namespace_id = var.ecs_service_discovery_namespace_id
  
  enable_autoscaling = var.ecs_enable_autoscaling
  min_capacity = var.ecs_min_capacity
  max_capacity = var.ecs_max_capacity
  scale_up_target_value = var.ecs_scale_up_target_value
  scale_down_target_value = var.ecs_scale_down_target_value
  
  common_tags = local.common_tags
}

# ============================================================
# Route53 Module - Uses ALB DNS name for alias records
# ============================================================
module "route53" {
  source = "../../../modules/route53"
  
  name = var.project_name
  
  domain_name = var.domain_name
  hosted_zone_id = var.hosted_zone_id
  create_hosted_zone = var.create_hosted_zone
  
  alias_records = {
    root = {
      name = var.domain_name
      type = "A"
      alias_name = module.alb.alb_dns_name
      alias_zone_id = module.alb.alb_zone_id
      alias_evaluate_target_health = true
    }
    www = {
      name = "www.${var.domain_name}"
      type = "A"
      alias_name = module.alb.alb_dns_name
      alias_zone_id = module.alb.alb_zone_id
      alias_evaluate_target_health = true
    }
    api = {
      name = "api.${var.domain_name}"
      type = "A"
      alias_name = module.alb.alb_dns_name
      alias_zone_id = module.alb.alb_zone_id
      alias_evaluate_target_health = true
    }
  }
  
  health_checks = {
    alb_health = {
      ip_address = ""
      port = 443
      type = "HTTPS"
      resource_path = "/health"
      fully_qualified_domain_name = var.domain_name
      request_interval = 30
      failure_threshold = 3
      enable_sni = true
      regions = ["us-east-1", "us-west-2", "eu-west-1"]
    }
  }
  
  enable_dnssec = var.route53_enable_dnssec
  
  common_tags = local.common_tags
}

# ============================================================
# Outputs - Cross-module references exposed
# ============================================================
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "vpc_cidr" {
  value = module.vpc.vpc_cidr
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "database_subnet_ids" {
  value = module.vpc.database_subnet_ids
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
  sensitive = true
}

output "rds_port" {
  value = module.rds.db_instance_port
}

output "rds_security_group_id" {
  value = module.rds.db_security_group_id
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "alb_arn" {
  value = module.alb.alb_arn
}

output "target_group_arn" {
  value = module.alb.target_group_arn
}

output "ecs_cluster_arn" {
  value = module.ecs.cluster_arn
}

output "ecs_service_arn" {
  value = module.ecs.service_arn
}

output "route53_hosted_zone_id" {
  value = module.route53.hosted_zone_id
}
