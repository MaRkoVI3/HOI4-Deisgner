# VPC Module
# Creates a VPC with public and private subnets across multiple AZs

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.common_tags, {
    Name = "${var.name}-vpc"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "${var.name}-igw"
  })
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.common_tags, {
    Name = "${var.name}-public-${data.aws_availability_zones.available.names[count.index]}"
    Type = "public"
  })
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = merge(var.common_tags, {
    Name = "${var.name}-private-${data.aws_availability_zones.available.names[count.index]}"
    Type = "private"
  })
}

resource "aws_subnet" "database" {
  count             = length(var.database_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.database_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = merge(var.common_tags, {
    Name = "${var.name}-database-${data.aws_availability_zones.available.names[count.index]}"
    Type = "database"
  })
}

resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? length(var.public_subnet_cidrs) : 0
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(var.common_tags, {
    Name = "${var.name}-nat-${data.aws_availability_zones.available.names[count.index]}"
  })

  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? length(var.public_subnet_cidrs) : 0
  domain = "vpc"

  tags = merge(var.common_tags, {
    Name = "${var.name}-nat-eip-${data.aws_availability_zones.available.names[count.index]}"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-public-rt"
  })
}

resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? length(var.private_subnet_cidrs) : 0
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-private-rt-${data.aws_availability_zones.available.names[count.index]}"
  })
}

resource "aws_route_table" "database" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "${var.name}-database-rt"
  })
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = var.enable_nat_gateway ? length(var.private_subnet_cidrs) : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_route_table_association" "database" {
  count          = length(var.database_subnet_cidrs)
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id
}

# VPC Flow Logs
resource "aws_flow_log" "main" {
  count        = var.enable_flow_logs ? 1 : 0
  vpc_id       = aws_vpc.main.id
  destination  = var.flow_log_destination_arn
  traffic_type = "ALL"

  tags = merge(var.common_tags, {
    Name = "${var.name}-vpc-flow-logs"
  })
}

# VPC Endpoints for private access to AWS services
resource "aws_vpc_endpoint" "s3" {
  count  = var.enable_vpc_endpoints ? 1 : 0
  vpc_id = aws_vpc.main.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = [aws_route_table.private[0].id]

  tags = merge(var.common_tags, {
    Name = "${var.name}-s3-endpoint"
  })
}

resource "aws_vpc_endpoint" "dynamodb" {
  count  = var.enable_vpc_endpoints ? 1 : 0
  vpc_id = aws_vpc.main.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  vpc_endpoint_type = "Gateway"

  route_table_ids = [aws_route_table.private[0].id]

  tags = merge(var.common_tags, {
    Name = "${var.name}-dynamodb-endpoint"
  })
}

resource "aws_vpc_endpoint" "ecr_api" {
  count  = var.enable_vpc_endpoints ? 1 : 0
  vpc_id = aws_vpc.main.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.ecr.api"
  vpc_endpoint_type = "Interface"

  subnet_ids = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoint.id]

  tags = merge(var.common_tags, {
    Name = "${var.name}-ecr-api-endpoint"
  })
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  count  = var.enable_vpc_endpoints ? 1 : 0
  vpc_id = aws_vpc.main.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.ecr.dkr"
  vpc_endpoint_type = "Interface"

  subnet_ids = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoint.id]

  tags = merge(var.common_tags, {
    Name = "${var.name}-ecr-dkr-endpoint"
  })
}

resource "aws_vpc_endpoint" "logs" {
  count  = var.enable_vpc_endpoints ? 1 : 0
  vpc_id = aws_vpc.main.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.logs"
  vpc_endpoint_type = "Interface"

  subnet_ids = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoint.id]

  tags = merge(var.common_tags, {
    Name = "${var.name}-logs-endpoint"
  })
}

resource "aws_security_group" "vpc_endpoint" {
  count = var.enable_vpc_endpoints ? 1 : 0
  name        = "${var.name}-vpc-endpoint-sg"
  description = "Security group for VPC endpoints"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, {
    Name = "${var.name}-vpc-endpoint-sg"
  })
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_region" "current" {}
