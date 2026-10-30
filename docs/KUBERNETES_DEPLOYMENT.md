# Kubernetes Deployment Guide — Student Attendance Management System

This document outlines the Kubernetes deployment topology, manifest organization, security policies, and operational runbook for running the **Student Attendance Management System** in a production Kubernetes cluster.

---

## 1. Architecture Overview

The system is deployed as a microservices architecture inside the dedicated `pulse-attendance` namespace:

```mermaid
flowchart TD
    Client([User Browser]) --> Ingress[NGINX Ingress Controller]
    
    subgraph K8s["Kubernetes Cluster (Namespace: pulse-attendance)"]
        Ingress -->|/api/* and /ws/*| BackendSvc[pulse-backend-service :8080]
        Ingress -->|/* (UI & Assets)| FrontendSvc[pulse-frontend-service :3000]
        
        BackendSvc --> BackendPods["Backend Pods (2 Replicas)\nSpring Boot 3 + Java 21"]
        FrontendSvc --> FrontendPods["Frontend Pods (2 Replicas)\nReact 19 + Nitro SSR"]
        
        ConfigMap[ConfigMap: pulse-config] -.-> BackendPods
        ConfigMap -.-> FrontendPods
        Secret[Secret: pulse-secrets] -.-> BackendPods
    end

    BackendPods -->|TLS / Port 27017| Atlas[("MongoDB Atlas Cloud\n(Managed Replica Set)")]
```

### Key Components

| Component | Kind | Replicas | Port | Probes | Security Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **pulse-backend** | Deployment | 2 | 8080 | Liveness & Readiness on `/api/health` | Non-root (`10001:10001`), no privilege escalation |
| **pulse-frontend** | Deployment | 2 | 3000 | Liveness & Readiness on `/` | Non-root (`1000:1000`), no privilege escalation |
| **pulse-backend-service** | Service (ClusterIP) | - | 8080 | Internal cluster traffic | - |
| **pulse-frontend-service** | Service (ClusterIP) | - | 3000 | Internal cluster traffic | - |
| **pulse-ingress** | Ingress (NGINX) | - | 80/443 | Path prefix routing (`/api`, `/ws`, `/`) | Body size 10MB, WebSocket upgrade |

---

## 2. Managed Database Architecture: Why MongoDB Atlas?

> [!IMPORTANT]
> **No In-Cluster MongoDB Deployment**: The repository deliberately **does not** include an in-cluster MongoDB StatefulSet or standalone database pod. 
> 
> **Rationale:**
> 1. **Production Reliability & High Availability**: The application connects to a managed multi-node MongoDB Atlas cluster (`cluster0.tndv2de.mongodb.net/pulse-attendance`) with automated backups, point-in-time recovery, and 99.99% SLA.
> 2. **Preventing Dual Database Drift**: Deploying an in-cluster MongoDB container would create a split-brain condition where development and production attendance data diverge, causing data inconsistency and risking silent data loss.
> 3. **Stateless Pods**: Keeping database storage outside Kubernetes makes backend pods completely stateless, enabling rapid auto-scaling, rolling updates, and self-healing across nodes without disk I/O bottlenecks.

Backend pods connect securely to MongoDB Atlas via TLS using the connection string injected from the Kubernetes `pulse-secrets` Secret.

---

## 3. Directory Structure

All Kubernetes resources are located in the `k8s/` folder:

```
k8s/
├── namespace.yaml             # Dedicated namespace: pulse-attendance
├── configmap.yaml             # Non-sensitive runtime environment variables
├── secret.example.yaml        # Template for MONGODB_URI and JWT_SECRET
├── backend-deployment.yaml    # Spring Boot Deployment (2 replicas, probes, security)
├── backend-service.yaml       # ClusterIP Service for backend (port 8080)
├── frontend-deployment.yaml   # React SSR Deployment (2 replicas, probes, security)
├── frontend-service.yaml      # ClusterIP Service for frontend (port 3000)
├── ingress.yaml               # Ingress routing rules and WebSocket upgrade configs
└── kustomization.yaml         # Kustomize bundle combining all resources
```

---

## 4. Prerequisites

Before deploying, ensure you have:
1. **Kubernetes Cluster**: Version 1.28 or newer (Minikube, Kind, k3s, EKS, GKE, or AKS).
2. **NGINX Ingress Controller**: Installed in the cluster.
   - For Minikube: `minikube addons enable ingress`
   - For cloud providers: Install via Helm `helm install ingress-nginx ingress-nginx/ingress-nginx`
3. **kubectl CLI**: Configured to communicate with your target cluster.

---

## 5. Step-by-Step Deployment Runbook

### Step 1: Create the Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Configure Production Secrets
Create the `pulse-secrets` Secret containing your MongoDB Atlas connection string and 64-character JWT secret key:

```bash
kubectl create secret generic pulse-secrets \
  --namespace=pulse-attendance \
  --from-literal=MONGODB_URI="mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.tndv2de.mongodb.net/pulse-attendance?retryWrites=true&w=majority" \
  --from-literal=JWT_SECRET="<YOUR_64_CHARACTER_HEX_OR_BASE64_SECRET>"
```

Verify that the secret was created (never commit secrets to Git):
```bash
kubectl get secret pulse-secrets -n pulse-attendance
```

### Step 3: Deploy via Kustomize
Apply all resources bundled in `k8s/kustomization.yaml`:

```bash
kubectl apply -k k8s/
```

### Step 4: Verify Pod & Service Status
Inspect the pods, services, and ingress controller:

```bash
kubectl get all -n pulse-attendance
```

Expected output:
```
NAME                                  READY   STATUS    RESTARTS   AGE
pod/pulse-backend-6789abc-xxxx        1/1     Running   0          45s
pod/pulse-backend-6789abc-yyyy        1/1     Running   0          45s
pod/pulse-frontend-1234def-aaaa       1/1     Running   0          45s
pod/pulse-frontend-1234def-bbbb       1/1     Running   0          45s

NAME                             TYPE        CLUSTER-IP       PORT(S)
service/pulse-backend-service    ClusterIP   10.96.120.10     8080/TCP
service/pulse-frontend-service   ClusterIP   10.96.120.20     3000/TCP

NAME                                      CLASS   HOSTS   ADDRESS          PORTS
ingress.networking.k8s.io/pulse-ingress   nginx   *       192.168.49.2     80
```

### Step 5: Test Health Probes
Port-forward or query the ingress to verify the backend health endpoint:
```bash
kubectl port-forward svc/pulse-backend-service 8080:8080 -n pulse-attendance
curl http://localhost:8080/api/health
```
Response:
```json
{"status":"UP","service":"pulse-attendance-backend"}
```

---

## 6. Zero-Downtime Rolling Updates & Rollback

### Rolling Update to a New Version
When a new container image tag is published by Jenkins or CI:

```bash
# Update backend image
kubectl set image deployment/pulse-backend backend=ghcr.io/trishulreddy3/pulse-backend:sha-abcdef1 -n pulse-attendance

# Update frontend image
kubectl set image deployment/pulse-frontend frontend=ghcr.io/trishulreddy3/pulse-frontend:sha-abcdef1 -n pulse-attendance

# Watch the rollout progress
kubectl rollout status deployment/pulse-backend -n pulse-attendance --watch
kubectl rollout status deployment/pulse-frontend -n pulse-attendance --watch
```

Because `maxUnavailable: 0` and `maxSurge: 1` are configured, Kubernetes boots new pods and confirms readiness before terminating old pods, ensuring zero downtime.

### Rollback Procedure
If a regression or failure occurs after deployment:

```bash
# Check rollout revision history
kubectl rollout history deployment/pulse-backend -n pulse-attendance

# Undo to previous revision
kubectl rollout undo deployment/pulse-backend -n pulse-attendance

# Check rollout status
kubectl rollout status deployment/pulse-backend -n pulse-attendance
```

---

## 7. Resource Limits & Autoscaling

Each deployment defines explicit container resource requests and limits:

```yaml
# Backend Resource Limits
resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1024Mi

# Frontend Resource Limits
resources:
  requests:
    cpu: 100m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Horizontal Pod Autoscaler (HPA) Recommendation
For high traffic during attendance marking peaks (start of academic periods), enable Horizontal Pod Autoscaling:

```bash
kubectl autoscale deployment pulse-backend --cpu-percent=70 --min=2 --max=6 -n pulse-attendance
kubectl autoscale deployment pulse-frontend --cpu-percent=75 --min=2 --max=5 -n pulse-attendance
```

---

## 8. Troubleshooting Runbook

| Symptom | Diagnostic Command | Root Cause & Remediation |
| :--- | :--- | :--- |
| **`CrashLoopBackOff` on Backend** | `kubectl logs deployment/pulse-backend -n pulse-attendance` | MongoDB Atlas network access blocked (IP whitelist) or incorrect credentials in `pulse-secrets`. Ensure cluster allows outbound egress to MongoDB Atlas. |
| **`ImagePullBackOff`** | `kubectl describe pod <pod-name> -n pulse-attendance` | Missing or expired GHCR image pull secret. Create `imagePullSecrets` with `kubectl create secret docker-registry ghcr-secret --docker-server=ghcr.io ...` and reference in pod spec. |
| **`502 Bad Gateway` on `/api`** | `kubectl get endpoints pulse-backend-service -n pulse-attendance` | Backend pods failed readiness probe or are not yet ready. Check `/api/health` response and pod logs. |
| **WebSocket disconnects on `/ws`** | `kubectl describe ingress pulse-ingress -n pulse-attendance` | Ensure `nginx.ingress.kubernetes.io/websocket-services: pulse-backend-service` annotation is present on the Ingress resource. |
