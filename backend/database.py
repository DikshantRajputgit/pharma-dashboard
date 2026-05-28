from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# MYSQL URL

DATABASE_URL = "mysql+pymysql://root:Up20aq%404666@localhost/pharma_analytics"

# ENGINE

engine = create_engine(

    DATABASE_URL,

    pool_pre_ping=True

)

# SESSION

SessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=engine

)

# BASE

Base = declarative_base()

# DB DEPENDENCY

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()