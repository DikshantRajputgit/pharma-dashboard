from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import Date

from database import Base

class SalesData(Base):

    __tablename__ = "sales_data"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    party_name = Column(String(255))

    district = Column(String(255))

    state = Column(String(50))

    item_name = Column(String(255))

    bill_no = Column(String(100))

    month = Column(String(50))

    date = Column(Date)

    expiry_date = Column(Date)

    qty = Column(Float)

    free_qty = Column(Float)

    net_qty = Column(Float)

    rate = Column(Float)

    discount = Column(Float)

    amount = Column(Float)

    mrp = Column(Float)

    cost = Column(Float)

    cost_amt = Column(Float)

    avg_sales = Column(Float)

    sales_person = Column(String(255))

    profit = Column(Float)

    profit_percent = Column(Float)