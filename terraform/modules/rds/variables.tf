variable "name" {
  description = "Name prefix for all resources"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "database_subnet_ids" {
  description = "IDs of the database subnets"
  type        = list(string)
}

variable "engine" {
  description = "Database engine"
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  description = "Database engine version"
  type        = string
  default     = "15.4"
}

variable "instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Max allocated storage for autoscaling"
  type        = number
  default     = 100
}

variable "storage_type" {
  description = "Storage type"
  type        = string
  default     = "gp3"
}

variable "storage_encrypted" {
  description = "Enable storage encryption"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
  default     = ""
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "app"
}

variable "master_username" {
  description = "Master username"
  type        = string
  default     = "admin"
}

variable "master_password" {
  description = "Master password (if not using managed password)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "manage_master_user_password" {
  description = "Use AWS managed master user password"
  type        = bool
  default     = true
}

variable "master_user_secret_kms_key_id" {
  description = "KMS key for managed master user password"
  type        = string
  default     = ""
}

variable "database_port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "allowed_security_group_ids" {
  description = "Security group IDs allowed to access the database"
  type        = list(string)
  default     = []
}

variable "parameter_group_family" {
  description = "Parameter group family"
  type        = string
  default     = "postgres15"
}

variable "db_parameters" {
  description = "Database parameters"
  type        = map(string)
  default     = {}
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion"
  type        = bool
  default     = false
}

variable "final_snapshot_identifier" {
  description = "Final snapshot identifier"
  type        = string
  default     = ""
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "enabled_cloudwatch_logs_exports" {
  description = "CloudWatch logs exports"
  type        = list(string)
  default     = ["postgresql", "upgrade"]
}

variable "monitoring_interval" {
  description = "Enhanced monitoring interval (0 to disable)"
  type        = number
  default     = 0
}

variable "monitoring_role_arn" {
  description = "IAM role ARN for enhanced monitoring"
  type        = string
  default     = ""
}

variable "performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = true
}

variable "performance_insights_kms_key_id" {
  description = "KMS key for Performance Insights"
  type        = string
  default     = ""
}

variable "performance_insights_retention_period" {
  description = "Performance Insights retention period"
  type        = number
  default     = 7
}

variable "create_database" {
  description = "Whether to create the database instance"
  type        = bool
  default     = true
}

variable "create_read_replica" {
  description = "Whether to create read replicas"
  type        = bool
  default     = false
}

variable "read_replica_count" {
  description = "Number of read replicas"
  type        = number
  default     = 1
}

variable "read_replica_instance_class" {
  description = "Instance class for read replicas"
  type        = string
  default     = "db.t3.micro"
}

variable "replica_mode" {
  description = "Replica mode (cross-region, etc.)"
  type        = string
  default     = ""
}

variable "source_region" {
  description = "Source region for cross-region replica"
  type        = string
  default     = ""
}

variable "ca_cert_identifier" {
  description = "CA certificate identifier"
  type        = string
  default     = "rds-ca-2019"
}

variable "enable_proxy" {
  description = "Enable RDS Proxy"
  type        = bool
  default     = false
}

variable "proxy_engine_family" {
  description = "Proxy engine family"
  type        = string
  default     = "POSTGRESQL"
}

variable "proxy_secret_arn" {
  description = "Secret ARN for proxy authentication"
  type        = string
  default     = ""
}

variable "proxy_iam_auth" {
  description = "Enable IAM authentication for proxy"
  type        = bool
  default     = false
}

variable "proxy_role_arn" {
  description = "IAM role ARN for proxy"
  type        = string
  default     = ""
}

variable "proxy_require_tls" {
  description = "Require TLS for proxy connections"
  type        = bool
  default     = true
}

variable "proxy_idle_client_timeout" {
  description = "Proxy idle client timeout"
  type        = number
  default     = 1800
}

variable "proxy_max_connections_percent" {
  description = "Proxy max connections percent"
  type        = number
  default     = 100
}

variable "proxy_max_idle_connections_percent" {
  description = "Proxy max idle connections percent"
  type        = number
  default     = 50
}

variable "proxy_connection_borrow_timeout" {
  description = "Proxy connection borrow timeout"
  type        = number
  default     = 120
}

variable "proxy_session_pinning_filters" {
  description = "Proxy session pinning filters"
  type        = list(string)
  default     = []
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
