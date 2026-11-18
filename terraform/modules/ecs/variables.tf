variable "name" {
  description = "Name prefix for all resources"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "enable_container_insights" {
  description = "Enable Container Insights"
  type        = bool
  default     = true
}

variable "enable_execute_command" {
  description = "Enable ECS Exec"
  type        = bool
  default     = true
}

variable "execute_command_kms_key_id" {
  description = "KMS key for ECS Exec encryption"
  type        = string
  default     = ""
}

variable "execute_command_log_group" {
  description = "CloudWatch log group for ECS Exec"
  type        = string
  default     = ""
}

variable "execute_command_encryption_enabled" {
  description = "Enable encryption for ECS Exec logs"
  type        = bool
  default     = true
}

variable "capacity_providers" {
  description = "List of capacity providers"
  type        = list(string)
  default     = ["FARGATE", "FARGATE_SPOT"]
}

variable "default_capacity_provider_strategy" {
  description = "Default capacity provider strategy"
  type = list(object({
    capacity_provider = string
    weight            = number
    base              = number
  }))
  default = [
    {
      capacity_provider = "FARGATE"
      weight            = 1
      base              = 0
    },
    {
      capacity_provider = "FARGATE_SPOT"
      weight            = 4
      base              = 0
    }
  ]
}

variable "create_task_role" {
  description = "Create a task IAM role"
  type        = bool
  default     = true
}

variable "task_role_policy" {
  description = "IAM policy for task role"
  type        = string
  default     = "{}"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "network_mode" {
  description = "Network mode for task definition"
  type        = string
  default     = "awsvpc"
}

variable "requires_compatibilities" {
  description = "Required compatibilities"
  type        = list(string)
  default     = ["FARGATE"]
}

variable "task_cpu" {
  description = "Task CPU units"
  type        = string
  default     = "256"
}

variable "task_memory" {
  description = "Task memory in MiB"
  type        = string
  default     = "512"
}

variable "pid_mode" {
  description = "PID mode"
  type        = string
  default     = ""
}

variable "ipc_mode" {
  description = "IPC mode"
  type        = string
  default     = ""
}

variable "container_definitions" {
  description = "Container definitions JSON"
  type        = list(any)
  default     = []
}

variable "volume_name" {
  description = "Volume name"
  type        = string
  default     = ""
}

variable "docker_volume_scope" {
  description = "Docker volume scope"
  type        = string
  default     = "shared"
}

variable "docker_volume_driver" {
  description = "Docker volume driver"
  type        = string
  default     = "local"
}

variable "docker_volume_driver_opts" {
  description = "Docker volume driver options"
  type        = map(string)
  default     = {}
}

variable "docker_volume_labels" {
  description = "Docker volume labels"
  type        = map(string)
  default     = {}
}

variable "ephemeral_storage_size" {
  description = "Ephemeral storage size in GiB"
  type        = number
  default     = 21
}

variable "inference_accelerator_device_name" {
  description = "Inference accelerator device name"
  type        = string
  default     = ""
}

variable "inference_accelerator_device_type" {
  description = "Inference accelerator device type"
  type        = string
  default     = ""
}

variable "placement_constraints" {
  description = "Placement constraints"
  type = list(object({
    type       = string
    expression = string
  }))
  default = []
}

variable "create_service" {
  description = "Create ECS service"
  type        = bool
  default     = true
}

variable "desired_count" {
  description = "Desired task count"
  type        = number
  default     = 1
}

variable "launch_type" {
  description = "Launch type"
  type        = string
  default     = "FARGATE"
}

variable "platform_version" {
  description = "Platform version"
  type        = string
  default     = "LATEST"
}

variable "scheduling_strategy" {
  description = "Scheduling strategy"
  type        = string
  default     = "REPLICA"
}

variable "capacity_provider_strategy" {
  description = "Capacity provider strategy"
  type = list(object({
    capacity_provider = string
    weight            = number
    base              = number
  }))
  default = []
}

variable "deployment_controller_type" {
  description = "Deployment controller type"
  type        = string
  default     = "ECS"
}

variable "deployment_circuit_breaker_enable" {
  description = "Enable deployment circuit breaker"
  type        = bool
  default     = true
}

variable "deployment_circuit_breaker_rollback" {
  description = "Rollback on circuit breaker"
  type        = bool
  default     = true
}

variable "deployment_maximum_percent" {
  description = "Deployment maximum percent"
  type        = number
  default     = 200
}

variable "deployment_minimum_healthy_percent" {
  description = "Deployment minimum healthy percent"
  type        = number
  default     = 100
}

variable "subnet_ids" {
  description = "Subnet IDs for service"
  type        = list(string)
  default     = []
}

variable "security_group_ids" {
  description = "Security group IDs for service"
  type        = list(string)
  default     = []
}

variable "assign_public_ip" {
  description = "Assign public IP"
  type        = bool
  default     = false
}

variable "enable_alb" {
  description = "Enable ALB integration"
  type        = bool
  default     = false
}

variable "target_group_arn" {
  description = "Target group ARN"
  type        = string
  default     = ""
}

variable "container_name" {
  description = "Container name"
  type        = string
  default     = "app"
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 8080
}

variable "enable_service_discovery" {
  description = "Enable service discovery"
  type        = bool
  default     = false
}

variable "service_discovery_namespace_id" {
  description = "Service discovery namespace ID"
  type        = string
  default     = ""
}

variable "service_discovery_arn" {
  description = "Service discovery service ARN"
  type        = string
  default     = ""
}

variable "enable_ecs_managed_tags" {
  description = "Enable ECS managed tags"
  type        = bool
  default     = true
}

variable "propagate_tags" {
  description = "Propagate tags"
  type        = string
  default     = "SERVICE"
}

variable "health_check_grace_period_seconds" {
  description = "Health check grace period"
  type        = number
  default     = 60
}

variable "ordered_placement_strategy" {
  description = "Ordered placement strategy"
  type = list(object({
    type  = string
    field = string
  }))
  default = [
    {
      type  = "spread"
      field = "attribute:ecs.availability-zone"
    }
  ]
}

variable "enable_autoscaling" {
  description = "Enable service auto scaling"
  type        = bool
  default     = true
}

variable "min_capacity" {
  description = "Minimum capacity"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum capacity"
  type        = number
  default     = 10
}

variable "scale_up_target_value" {
  description = "Scale up target CPU utilization"
  type        = number
  default     = 70
}

variable "scale_down_target_value" {
  description = "Scale down target memory utilization"
  type        = number
  default     = 70
}

variable "scale_in_cooldown" {
  description = "Scale in cooldown"
  type        = number
  default     = 300
}

variable "scale_out_cooldown" {
  description = "Scale out cooldown"
  type        = number
  default     = 300
}
