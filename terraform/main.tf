# Provider configuration
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

# 1. PostgreSQL Database (RDS)
resource "aws_db_instance" "payment_db" {
  allocated_storage    = 20
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  db_name              = "payment_orchestrator"
  username             = "jorge_admin"
  password             = var.db_password
  skip_final_snapshot  = true
}

# 2. Redis Cache (ElastiCache)
resource "aws_elasticache_cluster" "payment_redis" {
  cluster_id           = "payment-idempotency-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
}

# 3. ECS Cluster for the Node.js API
resource "aws_ecs_cluster" "app_cluster" {
  name = "resilient-pay-cluster"
}