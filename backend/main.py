
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base

from upload import router as upload_router
from analytics import router as analytics_router

# =========================
# CREATE TABLES
# =========================

Base.metadata.create_all(bind=engine)

# =========================
# APP
# =========================

app = FastAPI()


@app.get("/clear-db")
def clear_db():

    from database import SessionLocal
    from models import SalesData

    db = SessionLocal()

    try:

        db.query(SalesData).delete()

        db.commit()

        return {"status": "database cleared"}

    except Exception as e:

        return {"error": str(e)}

    finally:

        db.close()

# =========================
# CORS FIX
# =========================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)

# =========================
# ROUTERS
# =========================

app.include_router(upload_router)

app.include_router(analytics_router)

# =========================
# HOME
# =========================

@app.get("/")

def home():

    return {

        "message":
            "Pharma Analytics API Running"

    }

