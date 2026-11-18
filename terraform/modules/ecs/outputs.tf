output "cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "task_execution_role_arn" {
  description = "Task execution role ARN"
  value       = aws_iam_role.task_execution.arn
}

output "task_role_arn" {
  description = "Task role ARN"
  value       = var.create_task_role ? aws_iam_role.task[0].arn : ""
}

output "task_definition_arn" {
  description = "Task definition ARN"
  value       = aws_ecs_task_definition.main.arn
}

output "task_definition_family" {
  description = "Task definition family"
  value       = aws_ecs_task_definition.main.family
}

output "service_id" {
  description = "ECS service ID"
  value       = var.create_service ? aws_ecs_service.main[0].id : ""
}

output "service_name" {
  description = "ECS service name"
  value       = var.create_service ? aws_ecs_service.main[0].name : ""
}

output "service_arn" {
  description = "ECS service ARN"
  value       = var.create_service ? aws_ecs_service.main[0].arn : ""
}

output "log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "log_group_arn" {
  description = "CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.ecs.arn
}

output "service_discovery_service_id" {
  description = "Service discovery service ID"
  value       = var.enable_service_discovery ? aws_service_discovery_service.ecs[0].id : ""
}

output "service_discovery_service_arn" {
  description = "Service discovery service ARN"
  value       = var.enable_service_discovery ? aws_service_discovery_service.ecs[0].arn : ""
}

output "autoscaling_target_id" {
  description = "Auto scaling target ID"
  value       = var.enable_autoscaling && var.create_service ? aws_appautoscaling_target.ecs[0].id : ""
}
