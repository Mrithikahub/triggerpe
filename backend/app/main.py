from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os  # ← ADD THIS

from app.routes.workers   import router as workers_router
from app.routes.policies  import router as policies_router
from app.routes.premium   import router as premium_router
from app.routes.triggers  import router as triggers_router
from app.routes.claims    import router as claims_router
from app.routes.analytics import router as analytics_router

app = FastAPI(title="GigShield AI", version="2.0.0")

# 🔒 Environment-based CORS configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if ENVIRONMENT == "production":
    # Restrict in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://your-frontend-domain.com"],  # ← CHANGE THIS
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Allow all in development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers (your existing code)
app.include_router(workers_router,   prefix="/workers",   tags=["Workers"])
app.include_router(policies_router,  prefix="/policies",  tags=["Policies"])
app.include_router(premium_router,   prefix="/premium",   tags=["Premium"])
app.include_router(triggers_router,  prefix="/trigger",   tags=["Triggers"])
app.include_router(claims_router,    prefix="/claims",    tags=["Claims"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {
        "service": "GigShield AI",
        "status": "running",
        "environment": ENVIRONMENT,  # ← ADD THIS
        "docs": "/docs"
    }