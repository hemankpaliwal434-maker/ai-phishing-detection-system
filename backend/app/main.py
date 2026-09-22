import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.config import settings
from app.database import engine, Base
from app.models.entities import ScanRecord, IncidentReport, ThreatCampaign, SimulationCampaign, UserSecurityScore
from app.routers import analyze, soc, chat, awareness, ml_metrics

# Initialize Database Schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-Stack AI-Powered Phishing Website Detection and Cybersecurity Investigation Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for all devices and Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(analyze.router, prefix=settings.API_V1_STR)
app.include_router(soc.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(awareness.router, prefix=settings.API_V1_STR)
app.include_router(ml_metrics.router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ml_engine": "online",
        "ai_investigator": "active",
        "threat_intel": "synchronized"
    }


# Mount Single Page Application (SPA) frontend build for unified single-port access
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
assets_dir = os.path.join(dist_dir, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve frontend static build with SPA client-side fallback."""
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        return JSONResponse({"detail": "Not Found"}, status_code=404)

    target_file = os.path.join(dist_dir, full_path)
    if os.path.exists(target_file) and os.path.isfile(target_file):
        return FileResponse(target_file)

    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return JSONResponse({"status": "Backend running. Build frontend dist directory."}, status_code=200)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
