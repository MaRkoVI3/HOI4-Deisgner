# RDS Module
# Creates an RDS instance with parameter groups, subnet groups, and security groups

resource "aws_db_subnet_group" "main" {
  name       = "${var.name}-db-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = merge(var.common_tags, {
    Name = "${var.name}-db-subnet-group"
  })
}

resource "aws_security_group" "rds" {
  name        = "${var.name}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = var.database_port
    to_port         = var.database_port
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-rds-sg"
  })
}

resource "aws_db_parameter_group" "main" {
  name        = "${var.name}-db-param-group"
  family      = var.parameter_group_family
  description = "Parameter group for ${var.name}"

  dynamic "parameter" {
    for_each = var.db_parameters
    content {
      name  = parameter.key
      value = parameter.value
    }
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-db-param-group"
  })
}

resource "aws_db_instance" "main" {
  count = var.create_database ? 1 : 0

  identifier             = var.name
  engine                 = var.engine
  engine_version         = var.engine_version
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  max_allocated_storage  = var.max_allocated_storage
  storage_type           = var.storage_type
  storage_encrypted      = var.storage_encrypted
  kms_key_id             = var.kms_key_id
  
  db_name                = var.database_name
  username               = var.master_username
  password               = var.master_password
  manage_master_user_password = var.manage_master_user_password
  master_user_secret_kms_key_id = var.master_user_secret_kms_key_id
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name
  
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  
  skip_final_snapshot    = var.skip_final_snapshot
  final_snapshot_identifier = var.final_snapshot_identifier
  deletion_protection    = var.deletion_protection
  
  multi_az               = var.multi_az
  publicly_accessible    = false
  
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  monitoring_interval     = var.monitoring_interval
  monitoring_role_arn     = var.monitoring_role_arn
  
  performance_insights_enabled = var.performance_insights_enabled
  performance_insights_kms_key_id = var.performance_insights_kms_key_id
  performance_insights_retention_period = var.performance_insights_retention_period
  
  replica_mode           = var.replica_mode
  source_region          = var.source_region
  
  ca_cert_identifier     = var.ca_cert_identifier
  
  tags = merge(var.common_tags, {
    Name = "${var.name}-db"
  })

  lifecycle {
    prevent_destroy = var.deletion_protection
  }
}

resource "aws_db_instance" "replica" {
  count = var.create_read_replica ? var.read_replica_count : 0

  identifier             = "${var.name}-replica-${count.index + 1}"
  replicate_source_db    = aws_db_instance.main[0].identifier
  instance_class         = var.read_replica_instance_class
  monitoring_interval    = var.monitoring_interval
  monitoring_role_arn    = var.monitoring_role_arn
  performance_insights_enabled = var.performance_insights_enabled
  performance_insights_kms_key_id = var.performance_insights_kms_key_id
  performance_insights_retention_period = var.performance_insights_retention_period
  
  tags = merge(var.common_tags, {
    Name = "${var.name}-replica-${count.index + 1}"
    Role = "read-replica"
  })

  lifecycle {
    prevent_destroy = var.deletion_protection
  }
}

resource "aws_db_proxy" "main" {
  count = var.enable_proxy ? 1 : 0

  name                   = "${var.name}-proxy"
  engine_family          = var.proxy_engine_family
  auth {
    auth_scheme      = "SECRETS"
    secret_arn       = var.proxy_secret_arn
    iam_auth         = var.proxy_iam_auth
  }
  role_arn               = var.proxy_role_arn
  vpc_subnet_ids         = var.database_subnet_ids
  vpc_security_group_ids = [aws_security_group.rds.id]
  require_tls            = var.proxy_require_tls
  idle_client_timeout    = var.proxy_idle_client_timeout
  max_connections_percent = var.proxy_max_connections_percent
  max_idle_connections_percent = var.proxy_max_idle_connections_percent
  
  tags = merge(var.common_tags, {
    Name = "${var.name}-proxy"
  })
}

resource "aws_db_proxy_target_group" "main" {
  count = var.enable_proxy ? 1 : 0

  db_proxy_name = aws_db_proxy.main[0].name
  target_group_name = "default"
  db_instance_identifiers = [aws_db_instance.main[0].identifier]
  connection_pool_config {
    max_connections_percent = var.proxy_max_connections_percent
    max_idle_connections_percent = var.proxy_max_idle_connections_percent
    connection_borrow_timeout = var.proxy_connection_borrow_timeout
    session_pinning_filters = var.proxy_session_pinning_filters
  }
}

# Enhanced monitoring role (if needed)
resource "aws_iam_role" "enhanced_monitoring" {
  count = var.monitoring_interval > 0 ? 1 : 0

  name = "${var.name}-enhanced-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })

  tags = merge(var.common_tags, {
    Name = "${var.name}-enhanced-monitoring-role"
  })
}

resource "aws_iam_role_policy_attachment" "enhanced_monitoring" {
  count = var.monitoring_interval > 0 ? 1 : 0

  role       = aws_iam_role.enhanced_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
