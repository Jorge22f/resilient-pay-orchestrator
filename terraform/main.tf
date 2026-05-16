# 1. Networking (VPC)
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "payment-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-west-2a", "us-west-2b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = false
  single_nat_gateway = true # Saves cost for dev/test environments
}

# 2. Security Groups (The Firewalls)
resource "aws_security_group" "db_sg" {
  name        = "payment-db-sg"
  description = "Allow inbound traffic to RDS and Redis"
  vpc_id      = module.vpc.vpc_id

  # Allow Postgres traffic from within the VPC
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  # Allow Redis traffic from within the VPC
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. PostgreSQL Database (RDS)
resource "aws_db_subnet_group" "db_subnets" {
  name       = "payment-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_db_instance" "payment_db" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  db_name                = "payment_orchestrator"
  username               = "jorge_admin"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
}

# 4. Redis Cache (ElastiCache)
resource "aws_elasticache_subnet_group" "redis_subnets" {
  name       = "payment-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "payment_redis" {
  cluster_id           = "payment-idempotency-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnets.name
  security_group_ids   = [aws_security_group.db_sg.id]
}

# 5. ECS Cluster
resource "aws_ecs_cluster" "app_cluster" {
  name = "resilient-pay-cluster"
}