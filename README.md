# Resilient-Pay-Orchestrator

A production-grade, containerized financial middleware designed to eliminate double-charges and survive downstream gateway failures through advanced event-driven patterns.

## 🚀 The Mission
In financial systems, a "Gateway Timeout" is an ambiguous state. Did the payment fail, or is it simply slow? This orchestrator eliminates that ambiguity by providing a **Resilience Layer** that protects the ledger and ensures transactional integrity even during total provider outages.

## 🏗️ System Architecture
The system follows a "Defense-in-Depth" strategy across three primary layers:

### 1. Idempotency Guard (Redis)
* **The Problem**: Network retries often lead to double-charging customers.
* **The Solution**: Every request is validated against a Redis-backed idempotency registry using a unique `idempotency_key`.
* **Result**: Duplicate requests are blocked with a `425 Too Early` status before reaching the payment gateway.

### 2. Circuit Breaker (Opossum)
* **The Problem**: A slow downstream provider can cause "Cascading Failures," where your API hangs waiting for a response, eventually exhausting the Node.js event loop.
* **The Solution**: An Opossum circuit breaker monitors gateway health.
* **Result**: When failure thresholds are met, the breaker trips to an **Open** state, immediately failing requests to protect system resources until the provider recovers.

### 3. Persistence & Optimization (PostgreSQL)
* **Data Integrity**: A normalized PostgreSQL schema acts as the source of truth for the transaction ledger.
* **Performance**: Implements **Composite Indexing** on `(status, created_at)` to ensure high-speed lookups for monitoring and reconciliation.

## 📊 Full-Stack Observability
The project is fully instrumented with **Prometheus** and **Grafana** to provide a "Single Pane of Glass" into system health.

* **Latency Heatmap**: Visualizes the distribution of database and gateway response times, allowing for the identification of P99 tail-latencies.
* **Error Breakdown**: A real-time categorization of traffic (200 Success vs. 425 Idempotency Block vs. 500 Gateway Error).
* **Resource Monitoring**: Tracks Node.js event loop lag and active socket handles to detect memory leaks or thread pool exhaustion.

## 🛠️ Infrastructure as Code (IaC)
Infrastructure is managed via **Terraform**, ensuring that the PostgreSQL RDS instance, Redis ElastiCache, and ECS clusters are provisioned with consistent, secure configurations across environments.

## 🚦 Local Development
### Prerequisites
* Docker & Docker Compose
* Node.js 20+

### Getting Started
1.  **Clone the Repo**:
    ```bash
    git clone [https://github.com/Jorge22f/resilient-pay-orchestrator.git](https://github.com/Jorge22f/resilient-pay-orchestrator.git)
    cd resilient-pay-orchestrator
    ```
2.  **Spin up the Stack**:
    ```bash
    docker-compose up -d --build
    ```
3.  **Run the Load Test**:
    ```bash
    npm run test:load
    ```
4.  **View the Dashboard**:
    * **App API**: `http://localhost:8080`
    * **Prometheus**: `http://localhost:9090`
    * **Grafana**: `http://localhost:3001` (Login: admin/admin)

## 🧪 Simulation Scenarios
* **Success Path**: Standard load test showing 100% success with sub-millisecond DB lookups.
* **Outage Recovery**: Forcing a gateway error causes the **Success Rate** gauge to drop and the **Circuit Breaker** to trip. Upon reverting the error, the system enters a **Half
