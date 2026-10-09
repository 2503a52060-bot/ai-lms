import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from seed import seed_database

# Routers
from routers.auth_router import router as auth_router
from routers.student_router import router as student_router
from routers.faculty_router import router as faculty_router
from routers.admin_router import router as admin_router
from routers.files_router import router as files_router

from fastapi.responses import FileResponse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))
INDEX_HTML = os.path.join(FRONTEND_DIST, "index.html")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize database schema and demo seed
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="AI-Powered Learning Management and Student Performance Analytics System",
    version="2.0.0",
    description="Enterprise REST APIs with integrated AI Analytics Engine."
)

# Enable CORS for local development and all production cloud domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_and_cache_headers(request: Request, call_next):
    response = await call_next(request)
    # Prevent browser caching of protected pages and APIs so history/back/refresh cannot bypass login
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Mount uploads directory for static file serving
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers - mount auth at both /api/auth and /auth for universal production endpoint compatibility
app.include_router(auth_router, prefix="/api/auth")
app.include_router(auth_router, prefix="/auth")
app.include_router(student_router)
app.include_router(faculty_router)
app.include_router(admin_router)
app.include_router(files_router)

@app.get("/api/health")
def health():
    return {"status": "healthy", "database": "connected", "ai_engine": "active"}

# Mount frontend assets if compiled
assets_dir = os.path.join(FRONTEND_DIST, "assets")
if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.api_route("/", methods=["GET", "HEAD"])
async def serve_root():
    if os.path.isfile(INDEX_HTML):
        return FileResponse(INDEX_HTML)
    return {"status": "online", "message": "Frontend distribution not found. Please build frontend."}

@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_spa(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("auth/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    file_candidate = os.path.join(FRONTEND_DIST, full_path)
    if full_path and os.path.isfile(file_candidate):
        return FileResponse(file_candidate)
    if os.path.isfile(INDEX_HTML):
        return FileResponse(INDEX_HTML)
    return {"detail": "Not found"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

