# printX — Invoice & Receipt Reporting

Full-stack web app that renders pixel-perfect, print-friendly invoices and receipt reports. React + HTML5/CSS3 on the frontend; Node.js REST APIs calling DB2 stored procedures/SQL on the backend. Containerized with Docker, deployed via Kubernetes, with CI/CD.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, HTML5/CSS3 print layouts |
| Backend | Node.js, Express |
| Database | IBM DB2 (stored procedures + SQL) |
| PDF | Puppeteer (server) + browser print / html2pdf (client) |
| Containers | Docker, Docker Compose |
| Orchestration | Kubernetes |
| CI/CD | GitHub Actions |

## Project structure

```
printX/
├── backend/          # Node.js REST API
├── frontend/         # React print-friendly UI
├── k8s/              # Kubernetes manifests
├── .github/workflows # CI/CD
└── docker-compose.yml
```

## Quick start (local)

### Prerequisites

- Node.js 20+
- Docker (optional)
- IBM DB2 access (or use mock mode)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`

### Docker Compose

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000`

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/invoices/:id` | Invoice report data |
| GET | `/api/invoices/:id/pdf` | Invoice PDF download |
| GET | `/api/receipts/:id` | Receipt report data |
| GET | `/api/receipts/:id/pdf` | Receipt PDF download |
| GET | `/api/invoices?customerId=&from=&to=` | Search invoices |
| GET | `/api/receipts?customerId=&from=&to=` | Search receipts |

## DB2

SQL schema and stored procedures live in `backend/sql/`. Set `DB2_MOCK=true` in `.env` to run without a live DB2 instance (sample data).

## Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

Update image tags and secret values before applying to a real cluster.

## CI/CD

Push to `main` or open a PR to run lint/test/build. Merges to `main` build and push Docker images, then deploy to Kubernetes (configure registry and cluster secrets in GitHub Actions).

## Environment variables

See `backend/.env.example` for DB2 connection, logging, and PDF settings.
