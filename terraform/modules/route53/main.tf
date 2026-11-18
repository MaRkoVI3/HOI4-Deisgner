# Route53 Module
# Creates hosted zones, records, health checks, and traffic policies

resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0

  name = var.domain_name

  vpc {
    vpc_id = var.vpc_id
  }

  tags = merge(var.common_tags, {
    Name = var.domain_name
  })
}

resource "aws_route53_record" "main" {
  for_each = var.records

  zone_id = var.hosted_zone_id != "" ? var.hosted_zone_id : aws_route53_zone.main[0].zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = each.value.ttl
  records = each.value.records
  health_check_id = each.value.health_check_id

  weighted_routing_policy {
    weight = each.value.weighted_weight
  }

  latency_routing_policy {
    region = each.value.latency_region
  }

  failover_routing_policy {
    type = each.value.failover_type
  }

  geolocation_routing_policy {
    continent = each.value.geolocation_continent
    country   = each.value.geolocation_country
    subdivision = each.value.geolocation_subdivision
  }

  geoproximity_routing_policy {
    coordinates {
      latitude  = each.value.geoproximity_latitude
      longitude = each.value.geoproximity_longitude
    }
    bias = each.value.geoproximity_bias
  }

  multivalue_answer_routing_policy {
    enabled = each.value.multivalue_answer_enabled
  }

  set_identifier = each.value.set_identifier
}

# Alias Records
resource "aws_route53_record" "alias" {
  for_each = var.alias_records

  zone_id = var.hosted_zone_id != "" ? var.hosted_zone_id : aws_route53_zone.main[0].zone_id
  name    = each.value.name
  type    = each.value.type

  alias {
    name                   = each.value.alias_name
    zone_id                = each.value.alias_zone_id
    evaluate_target_health = each.value.alias_evaluate_target_health
  }

  health_check_id = each.value.health_check_id
}

# Health Checks
resource "aws_route53_health_check" "main" {
  for_each = var.health_checks

  ip_address         = each.value.ip_address
  port               = each.value.port
  type               = each.value.type
  resource_path      = each.value.resource_path
  fully_qualified_domain_name = each.value.fully_qualified_domain_name
  search_string      = each.value.search_string
  request_interval   = each.value.request_interval
  failure_threshold  = each.value.failure_threshold
  enable_sni         = each.value.enable_sni
  regions            = each.value.regions
  alarm_identifier   = each.value.alarm_identifier
  insufficient_data_health_status = each.value.insufficient_data_health_status

  tags = merge(var.common_tags, {
    Name = each.key
  })
}

# Traffic Policy
resource "aws_route53_traffic_policy" "main" {
  count = var.create_traffic_policy ? 1 : 0

  name = var.name
  document = jsonencode(var.traffic_policy_document)
  comment = var.traffic_policy_comment
}

resource "aws_route53_traffic_policy_instance" "main" {
  count = var.create_traffic_policy_instance ? 1 : 0

  name = var.name
  traffic_policy_id = aws_route53_traffic_policy.main[0].id
  traffic_policy_version = aws_route53_traffic_policy.main[0].version
  hosted_zone_id = var.hosted_zone_id != "" ? var.hosted_zone_id : aws_route53_zone.main[0].zone_id
  ttl = var.traffic_policy_instance_ttl
}

# Resolver Rules (for hybrid DNS)
resource "aws_route53_resolver_rule" "main" {
  for_each = var.resolver_rules

  name = each.key
  rule_type = each.value.rule_type
  domain_name = each.value.domain_name
  target_ips = each.value.target_ips
  resolver_endpoint_id = each.value.resolver_endpoint_id
  tags = merge(var.common_tags, {
    Name = each.key
  })
}

resource "aws_route53_resolver_rule_association" "main" {
  for_each = var.resolver_rule_associations

  resolver_rule_id = each.value.resolver_rule_id
  vpc_id = each.value.vpc_id
  name = each.key
}

# Resolver Endpoint
resource "aws_route53_resolver_endpoint" "main" {
  count = var.create_resolver_endpoint ? 1 : 0

  name = "${var.name}-resolver-endpoint"
  direction = var.resolver_endpoint_direction
  security_group_ids = var.resolver_endpoint_security_group_ids
  ip_addresses = var.resolver_endpoint_ip_addresses
  tags = merge(var.common_tags, {
    Name = "${var.name}-resolver-endpoint"
  })
}

# DNSSEC
resource "aws_route53_zone_dnssec" "main" {
  count = var.enable_dnssec ? 1 : 0

  hosted_zone_id = var.hosted_zone_id != "" ? var.hosted_zone_id : aws_route53_zone.main[0].zone_id
}

# Delegation Set
resource "aws_route53_delegation_set" "main" {
  count = var.create_delegation_set ? 1 : 0

  reference_name = var.name
}
