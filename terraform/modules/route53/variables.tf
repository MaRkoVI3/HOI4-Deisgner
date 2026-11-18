variable "name" {
  description = "Name prefix for all resources"
  type        = string
}

variable "domain_name" {
  description = "Domain name for hosted zone"
  type        = string
}

variable "hosted_zone_id" {
  description = "Existing hosted zone ID (if not creating)"
  type        = string
  default     = ""
}

variable "create_hosted_zone" {
  description = "Create hosted zone"
  type        = bool
  default     = true
}

variable "vpc_id" {
  description = "VPC ID for private hosted zone"
  type        = string
  default     = ""
}

variable "records" {
  description = "DNS records to create"
  type = map(object({
    name = string
    type = string
    ttl  = number
    records = list(string)
    health_check_id = string
    weighted_weight = number
    latency_region = string
    failover_type = string
    geolocation_continent = string
    geolocation_country = string
    geolocation_subdivision = string
    geoproximity_latitude = string
    geoproximity_longitude = string
    geoproximity_bias = number
    multivalue_answer_enabled = bool
    set_identifier = string
  }))
  default = {}
}

variable "alias_records" {
  description = "Alias records to create"
  type = map(object({
    name = string
    type = string
    alias_name = string
    alias_zone_id = string
    alias_evaluate_target_health = bool
    health_check_id = string
  }))
  default = {}
}

variable "health_checks" {
  description = "Health checks to create"
  type = map(object({
    ip_address = string
    port = number
    type = string
    resource_path = string
    fully_qualified_domain_name = string
    search_string = string
    request_interval = number
    failure_threshold = number
    enable_sni = bool
    regions = list(string)
    alarm_identifier = string
    insufficient_data_health_status = string
  }))
  default = {}
}

variable "create_traffic_policy" {
  description = "Create traffic policy"
  type        = bool
  default     = false
}

variable "traffic_policy_document" {
  description = "Traffic policy document"
  type        = string
  default     = "{}"
}

variable "traffic_policy_comment" {
  description = "Traffic policy comment"
  type        = string
  default     = ""
}

variable "create_traffic_policy_instance" {
  description = "Create traffic policy instance"
  type        = bool
  default     = false
}

variable "traffic_policy_instance_ttl" {
  description = "Traffic policy instance TTL"
  type        = number
  default     = 60
}

variable "resolver_rules" {
  description = "Resolver rules"
  type = map(object({
    rule_type = string
    domain_name = string
    target_ips = list(object({
      ip = string
      port = number
    }))
    resolver_endpoint_id = string
  }))
  default = {}
}

variable "resolver_rule_associations" {
  description = "Resolver rule associations"
  type = map(object({
    resolver_rule_id = string
    vpc_id = string
  }))
  default = {}
}

variable "create_resolver_endpoint" {
  description = "Create resolver endpoint"
  type        = bool
  default     = false
}

variable "resolver_endpoint_direction" {
  description = "Resolver endpoint direction"
  type        = string
  default     = "OUTBOUND"
}

variable "resolver_endpoint_security_group_ids" {
  description = "Resolver endpoint security group IDs"
  type        = list(string)
  default     = []
}

variable "resolver_endpoint_ip_addresses" {
  description = "Resolver endpoint IP addresses"
  type = list(object({
    subnet_id = string
    ip = string
  }))
  default = []
}

variable "enable_dnssec" {
  description = "Enable DNSSEC"
  type        = bool
  default     = false
}

variable "create_delegation_set" {
  description = "Create delegation set"
  type        = bool
  default     = false
}

variable "common_tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
