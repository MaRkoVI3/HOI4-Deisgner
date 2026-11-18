output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB zone ID"
  value       = aws_lb.main.zone_id
}

output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = var.create_security_group ? aws_security_group.alb[0].id : ""
}

output "target_group_arn" {
  description = "Main target group ARN"
  value       = aws_lb_target_group.main.arn
}

output "target_group_name" {
  description = "Main target group name"
  value       = aws_lb_target_group.main.name
}

output "additional_target_group_arns" {
  description = "Additional target group ARNs"
  value       = { for k, v in aws_lb_target_group.additional : k => v.arn }
}

output "http_listener_arn" {
  description = "HTTP listener ARN"
  value       = var.enable_http_listener ? aws_lb_listener.http[0].arn : ""
}

output "https_listener_arn" {
  description = "HTTPS listener ARN"
  value       = var.enable_https_listener ? aws_lb_listener.https[0].arn : ""
}

output "listener_rule_arns" {
  description = "Listener rule ARNs"
  value       = { for k, v in aws_lb_listener_rule.main : k => v.arn }
}
