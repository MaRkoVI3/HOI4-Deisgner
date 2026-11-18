output "hosted_zone_id" {
  description = "Hosted zone ID"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : var.hosted_zone_id
}

output "hosted_zone_name" {
  description = "Hosted zone name"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name : ""
}

output "hosted_zone_name_servers" {
  description = "Hosted zone name servers"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : []
}

output "record_ids" {
  description = "Record IDs"
  value       = { for k, v in aws_route53_record.main : k => v.id }
}

output "alias_record_ids" {
  description = "Alias record IDs"
  value       = { for k, v in aws_route53_record.alias : k => v.id }
}

output "health_check_ids" {
  description = "Health check IDs"
  value       = { for k, v in aws_route53_health_check.main : k => v.id }
}

output "traffic_policy_id" {
  description = "Traffic policy ID"
  value       = var.create_traffic_policy ? aws_route53_traffic_policy.main[0].id : ""
}

output "traffic_policy_version" {
  description = "Traffic policy version"
  value       = var.create_traffic_policy ? aws_route53_traffic_policy.main[0].version : 0
}

output "traffic_policy_instance_id" {
  description = "Traffic policy instance ID"
  value       = var.create_traffic_policy_instance ? aws_route53_traffic_policy_instance.main[0].id : ""
}

output "resolver_rule_ids" {
  description = "Resolver rule IDs"
  value       = { for k, v in aws_route53_resolver_rule.main : k => v.id }
}

output "resolver_endpoint_id" {
  description = "Resolver endpoint ID"
  value       = var.create_resolver_endpoint ? aws_route53_resolver_endpoint.main[0].id : ""
}

output "resolver_endpoint_arn" {
  description = "Resolver endpoint ARN"
  value       = var.create_resolver_endpoint ? aws_route53_resolver_endpoint.main[0].arn : ""
}

output "delegation_set_name_servers" {
  description = "Delegation set name servers"
  value       = var.create_delegation_set ? aws_route53_delegation_set.main[0].name_servers : []
}
