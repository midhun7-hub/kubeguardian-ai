from fastapi import FastAPI
from rca import analyze
from k8s_client import get_pods

app = FastAPI()


# Startup Probe
@app.get("/health")
def health():
    return {
        "service": "KubeGuardian AI Agent",
        "status": "running"
    }


# Readiness Probe
@app.get("/ready")
def ready():
    return {
        "status": "ready"
    }


# Liveness Probe
@app.get("/live")
def live():
    return {
        "status": "alive"
    }


@app.get("/rca/{issue}")
def rca(issue: str):
    return analyze(issue)


@app.get("/pods")
def pods():
    return get_pods()


@app.get("/cluster-health")
def cluster_health():
    return {
        "cluster": "kubeguardian",
        "status": "Healthy",
        "nodes": 1,
        "pods": 3
    }


@app.get("/incidents")
def incidents():
    return [
        {
            "pod": "backend",
            "issue": "OOMKilled",
            "severity": "Critical",
            "recommendation": "Increase memory limit"
        }
    ]