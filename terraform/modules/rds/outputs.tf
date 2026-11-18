output "db_instance_id" {
  description = "ID of the RDS instance"
  value       = var.create_database ? aws_db_instance.main[0].id : ""
}

output "db_instance_arn" {
  description = "ARN of the RDS instance"
  value       = var.create_database ? aws_db_instance.main[0].arn : ""
}

output "db_instance_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = var.create_database ? aws_db_instance.main[0].endpoint : ""
}

output "db_instance_port" {
  description = "Port of the RDS instance"
  value       = var.create_database ? aws_db_instance.main[0].port : 0
}

output "db_instance_hosted_zone_id" {
  description = "Hosted zone ID of the RDS instance"
  value       = var.create_database ? aws_db_instance.main[0].hosted_zone_id : ""
}

output "db_security_group_id" {
  description = "Security group ID for the RDS instance"
  value       = aws_security_group.rds.id
}

output "db_subnet_group_name" {
  description = "Name of the DB subnet group"
  value       = aws_db_subnet_group.main.name
}

output "db_parameter_group_name" {
  description = "Name of the DB parameter group"
  value       = aws_db_parameter_group.main.name
}

output "read_replica_ids" {
  description = "IDs of the read replicas"
  value       = var.create_read_replica ? aws_db_instance.replica[*].id : []
}

output "read_replica_endpoints" {
  description = "Endpoints of the read replicas"
  value       = var.create_read_replica ? aws_db_instance.replica[*].endpoint : []
}

output "db_proxy_name" {
  description = "Name of the RDS Proxy"
  value       = var.enable_proxy ? aws_db_proxy.main[0].name : ""
}

output "db_proxy_endpoint" {
  description = "Endpoint of the RDS Proxy"
  value       = var.enable_proxy ? aws_db_proxy.main[0].endpoint : ""
}

output "db_proxy_arn" {
  description = "ARN of the RDS Proxy"
  value       = var.enable_proxy ? aws_db_proxy.main[0].arn : ""
}
