output "db_endpoint" {
  value = aws_db_instance.payment_db.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.payment_redis.cache_nodes[0].address
}