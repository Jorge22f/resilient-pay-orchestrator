import client from "prom-client";

const register = new client.Registry();

register.setDefaultLabels({
  app: "resilient-pay-orchestrator",
});

client.collectDefaultMetrics({ register });

// Custom Histogram to track DB Latency
export const dbResponseTimeHistogram = new client.Histogram({
  name: "db_response_time_seconds",
  help: "Database response time in seconds",
  labelNames: ["operation"],
  registers: [register],
});

export const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

export { register };
