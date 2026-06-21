# KubeGuardian Demo Workload

A production-style demo application designed to generate realistic workloads, failures, logs, metrics, and incidents for **[KubeGuardian AI](https://github.com/kubeguardian-ai)** — an AI-powered Kubernetes SRE platform.

> **Note:** This is not the main KubeGuardian project. It exists solely as a target workload for monitoring, failure detection, root cause analysis, and remediation testing.

---

## Project Overview

KubeGuardian Demo Workload is a full-stack web application with:

- **React dashboard** for visualizing service health and triggering failure scenarios
- **Express.js API** with MongoDB persistence
- **Prometheus metrics** for observability pipelines
- **8 failure simulation endpoints** for SRE training and AI model validation
- **Docker Compose** for local development
- **Kubernetes manifests** for EKS deployment

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     KubeGuardian AI                         │
│         (Monitors, Analyzes, Remediates)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ scrapes / observes
                           ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │───▶│   Backend    │───▶│   MongoDB    │
│  React/Vite  │    │ Express/Node │    │              │
│  Port 3000   │    │  Port 5000   │    │  Port 27017  │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ├── /metrics (Prometheus)
                           ├── /health, /ready, /live
                           └── /simulate/* (failure injection)
```

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React, Vite, Tailwind CSS, Axios | Dashboard & failure simulator UI |
| Backend | Node.js, Express, Mongoose | REST API, metrics, failure injection |
| Database | MongoDB 7 | User data persistence |
| Monitoring | prom-client | Prometheus-compatible metrics |
| Infrastructure | Docker, Kubernetes | Container orchestration |

---

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB 7+ (or use Docker Compose)
- npm

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## Docker Setup

Start the entire stack with one command:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| MongoDB | localhost:27017 |
| Prometheus Metrics | http://localhost:5000/metrics |

Stop services:

```bash
docker compose down
```

Remove volumes:

```bash
docker compose down -v
```

---

## API Documentation

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health with DB status |
| GET | `/status` | Detailed runtime status |
| GET | `/ready` | Kubernetes readiness probe |
| GET | `/live` | Kubernetes liveness probe |
| GET | `/metrics` | Prometheus metrics |

### Users CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user `{ name, email }` |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Example

```bash
# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@kubeguardian.ai"}'

# Health check
curl http://localhost:5000/health
```

---

## Failure Simulation Guide

Access the **Failure Simulator** page in the dashboard or call endpoints directly.

| Endpoint | Effect | K8s Symptom |
|----------|--------|-------------|
| `GET /simulate/oom` | Allocates memory until limit | **OOMKilled** |
| `GET /simulate/cpu` | 60s CPU-intensive loop | High CPU, HPA scaling |
| `GET /simulate/crash` | Uncaught exception | **CrashLoopBackOff** |
| `GET /simulate/db-failure` | Invalid MongoDB connection | DB connection errors |
| `GET /simulate/slow-response` | 60 second delay | High latency alerts |
| `GET /simulate/log-storm` | 10,000+ log lines | Log pipeline stress |
| `GET /simulate/readiness-failure` | Toggles readiness | Pod marked **Unready** |
| `GET /simulate/liveness-failure` | Toggles liveness | Pod **restart** |

### Example

```bash
# Trigger log storm
curl http://localhost:5000/simulate/log-storm

# Trigger readiness failure (toggle)
curl http://localhost:5000/simulate/readiness-failure
```

> **Warning:** Only use failure simulations in demo/staging environments.

---

## Prometheus Metrics

Scrape endpoint: `GET /metrics`

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | Request latency |
| `http_active_requests` | Gauge | In-flight requests |
| `process_memory_bytes` | Gauge | Process memory (rss, heap) |
| `process_cpu_usage_percent` | Gauge | Process CPU usage |
| `system_memory_bytes` | Gauge | System memory |
| `system_cpu_usage_percent` | Gauge | System CPU load |
| `process_*` (default) | Various | Node.js default metrics |

### Prometheus Scrape Config

```yaml
scrape_configs:
  - job_name: kubeguardian-demo-backend
    static_configs:
      - targets: ['backend:5000']
    metrics_path: /metrics
    scrape_interval: 15s
```

---

## Kubernetes Deployment

### Build Images

```bash
docker build -t kubeguardian-demo-backend:latest ./backend
docker build -t kubeguardian-demo-frontend:latest ./frontend
```

### Deploy to Cluster

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongodb/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
```

### Backend Resource Limits

The backend deployment is configured with tight limits to enable OOM demonstrations:

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "250m"
    memory: "256Mi"
```

### Ingress Hosts

| Host | Service |
|------|---------|
| `kubeguardian-demo.local` | Frontend + API proxy |
| `api.kubeguardian-demo.local` | Backend direct |

Add to `/etc/hosts` or configure DNS for your ingress controller.

### Verify Deployment

```bash
kubectl get pods -n kubeguardian-demo
kubectl port-forward svc/backend 5000:5000 -n kubeguardian-demo
curl http://localhost:5000/health
```

---

## Environment Variables

### Backend (`backend/.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://mongodb:27017/kubeguardian` | MongoDB connection string |

### Frontend (`frontend/.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Backend API URL (empty for Docker/nginx proxy) |

---

## Future Improvements

- [ ] OpenTelemetry distributed tracing integration
- [ ] Grafana dashboard templates for demo metrics
- [ ] Helm chart for simplified EKS deployment
- [ ] Chaos Mesh / Litmus integration for scheduled failures
- [ ] Multi-replica backend with HPA manifest
- [ ] PersistentVolumeClaim for MongoDB in production
- [ ] JWT authentication for API endpoints
- [ ] WebSocket-based real-time metrics streaming
- [ ] Automated failure scenario scheduler
- [ ] Integration tests for failure simulation endpoints

---

## License

MIT — Demo workload for KubeGuardian AI platform evaluation and SRE training.
