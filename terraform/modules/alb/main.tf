# ALB Module
# Creates Application Load Balancer with target groups, listeners, and rules

resource "aws_lb" "main" {
  name               = var.name
  internal           = var.internal
  load_balancer_type = var.load_balancer_type
  security_groups    = var.security_group_ids
  subnets            = var.subnet_ids
  enable_deletion_protection = var.enable_deletion_protection

  access_logs {
    bucket  = var.access_logs_bucket
    prefix  = var.access_logs_prefix
    enabled = var.enable_access_logs
  }

  idle_timeout                = var.idle_timeout
  drop_invalid_header_fields  = var.drop_invalid_header_fields
  http2_enabled               = var.http2_enabled
  grpc_enabled                = var.grpc_enabled
  desync_mitigation_mode      = var.desync_mitigation_mode
  xff_header_processing_mode  = var.xff_header_processing_mode
  preserve_host_header        = var.preserve_host_header
  delete_protection           = var.enable_deletion_protection

  tags = merge(var.common_tags, {
    Name = var.name
  })
}

resource "aws_lb_target_group" "main" {
  name        = "${var.name}-tg"
  port        = var.target_group_port
  protocol    = var.target_group_protocol
  protocol_version = var.target_group_protocol_version
  vpc_id      = var.vpc_id
  target_type = var.target_type

  health_check {
    enabled             = var.health_check_enabled
    healthy_threshold   = var.health_check_healthy_threshold
    unhealthy_threshold = var.health_check_unhealthy_threshold
    timeout             = var.health_check_timeout
    interval            = var.health_check_interval
    path                = var.health_check_path
    matcher             = var.health_check_matcher
    port                = var.health_check_port
    protocol            = var.health_check_protocol
  }

  stickiness {
    type            = var.stickiness_type
    enabled         = var.stickiness_enabled
    cookie_duration = var.stickiness_cookie_duration
    cookie_name     = var.stickiness_cookie_name
  }

  deregistration_delay = var.deregistration_delay
  slow_start_duration  = var.slow_start_duration
  load_balancing_algorithm_type = var.load_balancing_algorithm_type

  tags = merge(var.common_tags, {
    Name = "${var.name}-tg"
  })
}

resource "aws_lb_listener" "http" {
  count = var.enable_http_listener ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = var.http_port
  protocol          = var.http_protocol

  default_action {
    type = var.http_default_action_type
    target_group_arn = var.http_default_action_type == "forward" ? aws_lb_target_group.main.arn : null
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
    fixed_response {
      content_type = "text/plain"
      message_body = "HTTP to HTTPS redirect"
      status_code  = "301"
    }
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-http-listener"
  })
}

resource "aws_lb_listener" "https" {
  count = var.enable_https_listener ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = var.https_port
  protocol          = var.https_protocol
  ssl_policy        = var.ssl_policy
  certificate_arn   = var.certificate_arn

  default_action {
    type = var.https_default_action_type
    target_group_arn = var.https_default_action_type == "forward" ? aws_lb_target_group.main.arn : null
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-https-listener"
  })
}

# Additional target groups
resource "aws_lb_target_group" "additional" {
  for_each = var.additional_target_groups

  name        = each.key
  port        = each.value.port
  protocol    = each.value.protocol
  protocol_version = each.value.protocol_version
  vpc_id      = var.vpc_id
  target_type = each.value.target_type

  health_check {
    enabled             = each.value.health_check_enabled
    healthy_threshold   = each.value.health_check_healthy_threshold
    unhealthy_threshold = each.value.health_check_unhealthy_threshold
    timeout             = each.value.health_check_timeout
    interval            = each.value.health_check_interval
    path                = each.value.health_check_path
    matcher             = each.value.health_check_matcher
    port                = each.value.health_check_port
    protocol            = each.value.health_check_protocol
  }

  stickiness {
    type            = each.value.stickiness_type
    enabled         = each.value.stickiness_enabled
    cookie_duration = each.value.stickiness_cookie_duration
    cookie_name     = each.value.stickiness_cookie_name
  }

  deregistration_delay = each.value.deregistration_delay
  slow_start_duration  = each.value.slow_start_duration
  load_balancing_algorithm_type = each.value.load_balancing_algorithm_type

  tags = merge(var.common_tags, {
    Name = "${var.name}-${each.key}"
  })
}

# Listener rules
resource "aws_lb_listener_rule" "main" {
  for_each = var.listener_rules

  listener_arn = each.value.listener_type == "https" ? aws_lb_listener.https[0].arn : aws_lb_listener.http[0].arn
  priority     = each.value.priority

  action {
    type = each.value.action_type
    target_group_arn = each.value.action_type == "forward" ? (each.value.target_group_name == "main" ? aws_lb_target_group.main.arn : aws_lb_target_group.additional[each.value.target_group_name].arn) : null
    redirect {
      port        = each.value.redirect_port
      protocol    = each.value.redirect_protocol
      status_code = each.value.redirect_status_code
    }
    fixed_response {
      content_type = each.value.fixed_response_content_type
      message_body = each.value.fixed_response_message_body
      status_code  = each.value.fixed_response_status_code
    }
    forward {
      target_group {
        arn = each.value.target_group_name == "main" ? aws_lb_target_group.main.arn : aws_lb_target_group.additional[each.value.target_group_name].arn
        weight = each.value.forward_weight
      }
      stickiness {
        enabled  = each.value.forward_stickiness_enabled
        duration = each.value.forward_stickiness_duration
      }
    }
    authenticate_oidc {
      authorization_endpoint = each.value.oidc_authorization_endpoint
      client_id             = each.value.oidc_client_id
      client_secret         = each.value.oidc_client_secret
      issuer                = each.value.oidc_issuer
      on_unauthenticated_request = each.value.oidc_on_unauthenticated_request
      scope                 = each.value.oidc_scope
      session_cookie_name   = each.value.oidc_session_cookie_name
      session_timeout       = each.value.oidc_session_timeout
      use_existing_client_secret = each.value.oidc_use_existing_client_secret
    }
    authenticate_cognito {
      user_pool_arn        = each.value.cognito_user_pool_arn
      user_pool_client_id  = each.value.cognito_user_pool_client_id
      user_pool_domain     = each.value.cognito_user_pool_domain
      on_unauthenticated_request = each.value.cognito_on_unauthenticated_request
      scope                = each.value.cognito_scope
      session_cookie_name  = each.value.cognito_session_cookie_name
      session_timeout      = each.value.cognito_session_timeout
    }
  }

  condition {
    host_header {
      values = each.value.host_header_values
    }
  }

  condition {
    path_pattern {
      values = each.value.path_pattern_values
    }
  }

  condition {
    http_header {
      http_header_name = each.value.http_header_name
      values           = each.value.http_header_values
    }
  }

  condition {
    query_string {
      key   = each.value.query_string_key
      value = each.value.query_string_value
    }
  }

  condition {
    http_request_method {
      values = each.value.http_request_method_values
    }
  }

  condition {
    source_ip {
      values = each.value.source_ip_values
    }
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-rule-${each.key}"
  })
}

# WAF Association
resource "aws_wafv2_web_acl_association" "main" {
  count = var.waf_web_acl_arn != "" ? 1 : 0

  resource_arn = aws_lb.main.arn
  web_acl_arn  = var.waf_web_acl_arn
}

# Shield Protection
resource "aws_shield_protection" "main" {
  count = var.enable_shield_protection ? 1 : 0

  name = "${var.name}-shield-protection"
  resource_arn = aws_lb.main.arn
}

# ALB Security Group
resource "aws_security_group" "alb" {
  count = var.create_security_group ? 1 : 0

  name        = "${var.name}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = var.http_port
    to_port     = var.http_port
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
    ipv6_cidr_blocks = var.allowed_ipv6_cidr_blocks
  }

  ingress {
    from_port   = var.https_port
    to_port     = var.https_port
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
    ipv6_cidr_blocks = var.allowed_ipv6_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-alb-sg"
  })
}
