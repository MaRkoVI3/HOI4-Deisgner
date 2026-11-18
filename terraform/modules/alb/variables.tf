variable "name" {
  description = "Name prefix for all resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for ALB"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security group IDs for ALB"
  type        = list(string)
  default     = []
}

variable "internal" {
  description = "Whether ALB is internal"
  type        = bool
  default     = false
}

variable "load_balancer_type" {
  description = "Load balancer type"
  type        = string
  default     = "application"
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "enable_access_logs" {
  description = "Enable access logs"
  type        = bool
  default     = true
}

variable "access_logs_bucket" {
  description = "S3 bucket for access logs"
  type        = string
  default     = ""
}

variable "access_logs_prefix" {
  description = "S3 prefix for access logs"
  type        = string
  default     = ""
}

variable "idle_timeout" {
  description = "Idle timeout in seconds"
  type        = number
  default     = 60
}

variable "drop_invalid_header_fields" {
  description = "Drop invalid header fields"
  type        = bool
  default     = true
}

variable "http2_enabled" {
  description = "Enable HTTP/2"
  type        = bool
  default     = true
}

variable "grpc_enabled" {
  description = "Enable gRPC"
  type        = bool
  default     = false
}

variable "desync_mitigation_mode" {
  description = "Desync mitigation mode"
  type        = string
  default     = "monitor"
}

variable "xff_header_processing_mode" {
  description = "XFF header processing mode"
  type        = string
  default     = "append"
}

variable "preserve_host_header" {
  description = "Preserve host header"
  type        = bool
  default     = false
}

# Target Group
variable "target_group_port" {
  description = "Target group port"
  type        = number
  default     = 8080
}

variable "target_group_protocol" {
  description = "Target group protocol"
  type        = string
  default     = "HTTP"
}

variable "target_group_protocol_version" {
  description = "Target group protocol version"
  type        = string
  default     = "HTTP1"
}

variable "target_type" {
  description = "Target type"
  type        = string
  default     = "ip"
}

variable "health_check_enabled" {
  description = "Enable health check"
  type        = bool
  default     = true
}

variable "health_check_healthy_threshold" {
  description = "Health check healthy threshold"
  type        = number
  default     = 2
}

variable "health_check_unhealthy_threshold" {
  description = "Health check unhealthy threshold"
  type        = number
  default     = 3
}

variable "health_check_timeout" {
  description = "Health check timeout"
  type        = number
  default     = 30
}

variable "health_check_interval" {
  description = "Health check interval"
  type        = number
  default     = 30
}

variable "health_check_path" {
  description = "Health check path"
  type        = string
  default     = "/health"
}

variable "health_check_matcher" {
  description = "Health check matcher"
  type        = string
  default     = "200"
}

variable "health_check_port" {
  description = "Health check port"
  type        = string
  default     = "traffic-port"
}

variable "health_check_protocol" {
  description = "Health check protocol"
  type        = string
  default     = "HTTP"
}

variable "stickiness_type" {
  description = "Stickiness type"
  type        = string
  default     = "lb_cookie"
}

variable "stickiness_enabled" {
  description = "Enable stickiness"
  type        = bool
  default     = false
}

variable "stickiness_cookie_duration" {
  description = "Stickiness cookie duration"
  type        = number
  default     = 86400
}

variable "stickiness_cookie_name" {
  description = "Stickiness cookie name"
  type        = string
  default     = ""
}

variable "deregistration_delay" {
  description = "Deregistration delay"
  type        = number
  default     = 300
}

variable "slow_start_duration" {
  description = "Slow start duration"
  type        = number
  default     = 0
}

variable "load_balancing_algorithm_type" {
  description = "Load balancing algorithm"
  type        = string
  default     = "round_robin"
}

# HTTP Listener
variable "enable_http_listener" {
  description = "Enable HTTP listener"
  type        = bool
  default     = true
}

variable "http_port" {
  description = "HTTP port"
  type        = number
  default     = 80
}

variable "http_protocol" {
  description = "HTTP protocol"
  type        = string
  default     = "HTTP"
}

variable "http_default_action_type" {
  description = "HTTP default action type"
  type        = string
  default     = "redirect"
}

# HTTPS Listener
variable "enable_https_listener" {
  description = "Enable HTTPS listener"
  type        = bool
  default     = true
}

variable "https_port" {
  description = "HTTPS port"
  type        = number
  default     = 443
}

variable "https_protocol" {
  description = "HTTPS protocol"
  type        = string
  default     = "HTTPS"
}

variable "ssl_policy" {
  description = "SSL policy"
  type        = string
  default     = "ELBSecurityPolicy-TLS13-1-2-2021-06"
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  default     = ""
}

variable "https_default_action_type" {
  description = "HTTPS default action type"
  type        = string
  default     = "forward"
}

# Additional Target Groups
variable "additional_target_groups" {
  description = "Additional target groups"
  type = map(object({
    port        = number
    protocol    = string
    protocol_version = string
    target_type = string
    health_check_enabled = bool
    health_check_healthy_threshold = number
    health_check_unhealthy_threshold = number
    health_check_timeout = number
    health_check_interval = number
    health_check_path = string
    health_check_matcher = string
    health_check_port = string
    health_check_protocol = string
    stickiness_type = string
    stickiness_enabled = bool
    stickiness_cookie_duration = number
    stickiness_cookie_name = string
    deregistration_delay = number
    slow_start_duration = number
    load_balancing_algorithm_type = string
  }))
  default = {}
}

# Listener Rules
variable "listener_rules" {
  description = "Listener rules"
  type = map(object({
    listener_type = string
    priority = number
    action_type = string
    target_group_name = string
    redirect_port = string
    redirect_protocol = string
    redirect_status_code = string
    fixed_response_content_type = string
    fixed_response_message_body = string
    fixed_response_status_code = string
    forward_weight = number
    forward_stickiness_enabled = bool
    forward_stickiness_duration = number
    oidc_authorization_endpoint = string
    oidc_client_id = string
    oidc_client_secret = string
    oidc_issuer = string
    oidc_on_unauthenticated_request = string
    oidc_scope = string
    oidc_session_cookie_name = string
    oidc_session_timeout = number
    oidc_use_existing_client_secret = bool
    cognito_user_pool_arn = string
    cognito_user_pool_client_id = string
    cognito_user_pool_domain = string
    cognito_on_unauthenticated_request = string
    cognito_scope = string
    cognito_session_cookie_name = string
    cognito_session_timeout = number
    host_header_values = list(string)
    path_pattern_values = list(string)
    http_header_name = string
    http_header_values = list(string)
    query_string_key = string
    query_string_value = string
    http_request_method_values = list(string)
    source_ip_values = list(string)
  }))
  default = {}
}

# WAF
variable "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  type        = string
  default     = ""
}

# Shield
variable "enable_shield_protection" {
  description = "Enable Shield protection"
  type        = bool
  default     = false
}

# Security Group
variable "create_security_group" {
  description = "Create security group"
  type        = bool
  default     = false
}

variable "allowed_cidr_blocks" {
  description = "Allowed CIDR blocks"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "allowed_ipv6_cidr_blocks" {
  description = "Allowed IPv6 CIDR blocks"
  type        = list(string)
  default     = ["::/0"]
}

variable "common_tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
