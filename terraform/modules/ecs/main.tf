# ECS Module
# Creates ECS cluster, services, task definitions, and related resources

resource "aws_ecs_cluster" "main" {
  name = var.name

  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }

  configuration {
    execute_command_configuration {
      logging = var.enable_execute_command ? "OVERRIDE" : "NONE"
      kms_key_id = var.execute_command_kms_key_id
      log_configuration {
        cloud_watch_log_group_name = var.execute_command_log_group
        cloud_watch_encryption_enabled = var.execute_command_encryption_enabled
      }
    }
  }

  tags = merge(var.common_tags, {
    Name = var.name
  })
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name
  capacity_providers = var.capacity_providers
  default_capacity_provider_strategy = var.default_capacity_provider_strategy
}

# ECS Service IAM Role
resource "aws_iam_role" "ecs_service" {
  name = "${var.name}-ecs-service-role"

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

  tags = merge(var.common_tags, {
    Name = "${var.name}-ecs-service-role"
  })
}

resource "aws_iam_role_policy_attachment" "ecs_service" {
  role       = aws_iam_role.ecs_service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole"
}

# Task Execution Role
resource "aws_iam_role" "task_execution" {
  name = "${var.name}-task-execution-role"

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

  tags = merge(var.common_tags, {
    Name = "${var.name}-task-execution-role"
  })
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task Role
resource "aws_iam_role" "task" {
  count = var.create_task_role ? 1 : 0

  name = "${var.name}-task-role"

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

  tags = merge(var.common_tags, {
    Name = "${var.name}-task-role"
  })
}

resource "aws_iam_policy" "task" {
  count = var.create_task_role ? 1 : 0

  name = "${var.name}-task-policy"
  policy = jsonencode(var.task_role_policy)

  tags = merge(var.common_tags, {
    Name = "${var.name}-task-policy"
  })
}

resource "aws_iam_role_policy_attachment" "task" {
  count = var.create_task_role ? 1 : 0

  role       = aws_iam_role.task[0].name
  policy_arn = aws_iam_policy.task[0].arn
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs" {
  name = "/ecs/${var.name}"
  retention_in_days = var.log_retention_days

  tags = merge(var.common_tags, {
    Name = "/ecs/${var.name}"
  })
}

# ECS Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = var.name
  network_mode             = var.network_mode
  requires_compatibilities = var.requires_compatibilities
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = var.create_task_role ? aws_iam_role.task[0].arn : null
  pid_mode                 = var.pid_mode
  ipc_mode                 = var.ipc_mode

  container_definitions = jsonencode(var.container_definitions)

  volume {
    name = var.volume_name
    docker_volume_configuration {
      scope         = var.docker_volume_scope
      driver        = var.docker_volume_driver
      driver_opts   = var.docker_volume_driver_opts
      labels        = var.docker_volume_labels
    }
  }

  ephemeral_storage {
    size_in_gib = var.ephemeral_storage_size
  }

  inference_accelerator {
    device_name = var.inference_accelerator_device_name
    device_type = var.inference_accelerator_device_type
  }

  placement_constraints = var.placement_constraints

  tags = merge(var.common_tags, {
    Name = "${var.name}-task-definition"
  })
}

# ECS Service
resource "aws_ecs_service" "main" {
  count = var.create_service ? 1 : 0

  name            = var.name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.desired_count
  launch_type     = var.launch_type
  platform_version = var.platform_version
  scheduling_strategy = var.scheduling_strategy

  capacity_provider_strategy = var.capacity_provider_strategy

  deployment_controller {
    type = var.deployment_controller_type
  }

  deployment_circuit_breaker {
    enable   = var.deployment_circuit_breaker_enable
    rollback = var.deployment_circuit_breaker_rollback
  }

  deployment_maximum_percent         = var.deployment_maximum_percent
  deployment_minimum_healthy_percent = var.deployment_minimum_healthy_percent

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = var.security_group_ids
    assign_public_ip = var.assign_public_ip
  }

  load_balancer = var.enable_alb ? [{
    target_group_arn = var.target_group_arn
    container_name   = var.container_name
    container_port   = var.container_port
  }] : []

  service_registries = var.enable_service_discovery ? [{
    registry_arn = var.service_discovery_arn
    port         = var.container_port
    container_name = var.container_name
    container_port = var.container_port
  }] : []

  enable_ecs_managed_tags = var.enable_ecs_managed_tags
  propagate_tags          = var.propagate_tags

  health_check_grace_period_seconds = var.health_check_grace_period_seconds

  ordered_placement_strategy = var.ordered_placement_strategy

  placement_constraints = var.placement_constraints

  tags = merge(var.common_tags, {
    Name = "${var.name}-service"
  })

  depends_on = [aws_iam_role_policy_attachment.ecs_service]
}

# ECS Service Auto Scaling
resource "aws_appautoscaling_target" "ecs" {
  count = var.enable_autoscaling && var.create_service ? 1 : 0

  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main[0].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "scale_up" {
  count = var.enable_autoscaling && var.create_service ? 1 : 0

  name               = "${var.name}-scale-up"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs[0].service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = var.scale_up_target_value
    scale_in_cooldown  = var.scale_in_cooldown
    scale_out_cooldown = var.scale_out_cooldown
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "scale_down" {
  count = var.enable_autoscaling && var.create_service ? 1 : 0

  name               = "${var.name}-scale-down"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs[0].service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = var.scale_down_target_value
    scale_in_cooldown  = var.scale_in_cooldown
    scale_out_cooldown = var.scale_out_cooldown
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
  }
}

# Service Discovery
resource "aws_service_discovery_service" "ecs" {
  count = var.enable_service_discovery ? 1 : 0

  name = var.name
  namespace_id = var.service_discovery_namespace_id

  dns_config {
    namespace_id = var.service_discovery_namespace_id
    routing_policy = "MULTIVALUE"
    dns_records = [{
      type  = "A"
      ttl   = 60
    }, {
      type  = "SRV"
      ttl   = 60
    }]
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-service-discovery"
  })
}
