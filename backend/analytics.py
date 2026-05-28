
from fastapi import APIRouter
from sqlalchemy import func
from datetime import datetime

from database import SessionLocal
from models import SalesData

router = APIRouter()

# =========================
# DASHBOARD
# =========================

@router.get("/dashboard")

def dashboard(

    state: str = None,
    salesperson: str = None,
    month: str = None,
    party: str = None,
    product: str = None

):

    db = SessionLocal()

    # =========================
    # BASE QUERY
    # =========================

    query = db.query(SalesData)

    # =========================
    # FILTERS
    # =========================

    if state:

        state_list = state.split(",")

        query = query.filter(
            SalesData.state.in_(state_list)
        )

    if salesperson:

        salesperson_list = salesperson.split(",")

        query = query.filter(
            SalesData.sales_person.in_(salesperson_list)
        )

    if party:

        party_list = party.split(",")

        query = query.filter(
            SalesData.party_name.in_(party_list)
        )

    if product:

        product_list = product.split(",")

        query = query.filter(
            SalesData.item_name.in_(product_list)
        )

    if month:

        month_list = month.split(",")

        query = query.filter(
            SalesData.month.in_(month_list)
        )

    # =========================
    # KPIS
    # =========================

    total_sales = query.with_entities(
        func.sum(SalesData.amount)
    ).scalar() or 0

    total_qty = query.with_entities(
        func.sum(SalesData.net_qty)
    ).scalar() or 0

    total_bills = query.with_entities(
        func.count(
            func.distinct(
                SalesData.bill_no
            )
        )
    ).scalar() or 0

    total_customers = query.with_entities(
        func.count(
            func.distinct(
                SalesData.party_name
            )
        )
    ).scalar() or 0

    total_products = query.with_entities(
        func.count(
            func.distinct(
                SalesData.item_name
            )
        )
    ).scalar() or 0

    total_cost = query.with_entities(
        func.sum(SalesData.cost_amt)
    ).scalar() or 0

    avg_bill_value = (
        total_sales / total_bills
        if total_bills else 0
    )

    # =========================
    # MONTHLY SALES
    # =========================

    monthly_sales_raw = query.with_entities(

        SalesData.month,

        func.sum(
            SalesData.amount
        )

    ).group_by(

        SalesData.month

    ).all()

    monthly_sales = [

        {
            "month": row[0],
            "sales": round(row[1],2)
        }

        for row in monthly_sales_raw

        if row[0]

    ]

    # =========================
    # SORT MONTHS
    # =========================

    try:

        monthly_sales.sort(

            key=lambda x:

            datetime.strptime(
                x["month"],
                "%b-%Y"
            )

        )

    except:

        pass

    # =========================
    # MOM GROWTH
    # =========================

    mom_growth = []

    previous_sales = None

    for row in monthly_sales:

        current_sales = row["sales"]

        growth = 0

        if previous_sales and previous_sales != 0:

            growth = (

                (
                    current_sales -
                    previous_sales
                ) / previous_sales

            ) * 100

        mom_growth.append({

            "month": row["month"],

            "growth": round(growth,2)

        })

        previous_sales = current_sales

    # =========================
    # STATE SALES
    # =========================

    state_sales_raw = query.with_entities(

        SalesData.state,

        func.sum(
            SalesData.amount
        )

    ).group_by(

        SalesData.state

    ).order_by(

        func.sum(
            SalesData.amount
        ).desc()

    ).all()

    state_sales = [

        {
            "state": row[0],
            "sales": round(row[1],2)
        }

        for row in state_sales_raw

        if row[0]

    ]

    # =========================
    # TOP CUSTOMERS
    # =========================

    top_customers_raw = query.with_entities(

        SalesData.party_name,

        func.sum(
            SalesData.amount
        )

    ).group_by(

        SalesData.party_name

    ).order_by(

        func.sum(
            SalesData.amount
        ).desc()

    ).all()

    top_customers = [

        {
            "customer": row[0],
            "sales": round(row[1],2)
        }

        for row in top_customers_raw

        if row[0]

    ]

    # =========================
    # TOP PRODUCTS
    # =========================

    top_products_raw = query.with_entities(

        SalesData.item_name,

        func.sum(
            SalesData.amount
        )

    ).group_by(

        SalesData.item_name

    ).order_by(

        func.sum(
            SalesData.amount
        ).desc()

    ).all()

    top_products = [

        {
            "product": row[0],
            "sales": round(row[1],2)
        }

        for row in top_products_raw

        if row[0]

    ]

    # =========================
    # SALES PERSON SALES
    # =========================

    sales_person_sales_raw = query.with_entities(

        SalesData.sales_person,

        func.sum(
            SalesData.amount
        )

    ).group_by(

        SalesData.sales_person

    ).order_by(

        func.sum(
            SalesData.amount
        ).desc()

    ).all()

    sales_person_sales = [

        {
            "salesperson": row[0],
            "sales": round(row[1],2)
        }

        for row in sales_person_sales_raw

        if row[0]

    ]

    # =========================
    # CUSTOMERS HANDLED
    # =========================

    sales_person_customers_raw = query.with_entities(

        SalesData.sales_person,

        func.count(
            func.distinct(
                SalesData.party_name
            )
        )

    ).group_by(

        SalesData.sales_person

    ).order_by(

        func.count(
            func.distinct(
                SalesData.party_name
            )
        ).desc()

    ).all()

    sales_person_customers = [

        {
            "salesperson": row[0],
            "customers": row[1]
        }

        for row in sales_person_customers_raw

        if row[0]

    ]

    # =========================
    # NEW / REPEAT CUSTOMERS
    # =========================

    new_customers = []

    repeat_customers = []

    seen_customers = set()

    all_months = [
        x["month"]
        for x in monthly_sales
    ]

    for month_name in all_months:

        month_customers_raw = db.query(

            SalesData.party_name

        ).filter(

            SalesData.month == month_name

        ).distinct().all()

        month_customers = set([

            x[0]

            for x in month_customers_raw

            if x[0]

        ])

        new_count = len(
            month_customers - seen_customers
        )

        repeat_count = len(
            month_customers.intersection(
                seen_customers
            )
        )

        new_customers.append({

            "month": month_name,
            "count": new_count

        })

        repeat_customers.append({

            "month": month_name,
            "count": repeat_count

        })

        seen_customers.update(
            month_customers
        )

    # =========================
    # FAST MOVING PRODUCTS
    # =========================

    fast_moving_raw = query.with_entities(

        SalesData.item_name,

        func.sum(
            SalesData.net_qty
        )

    ).group_by(

        SalesData.item_name

    ).order_by(

        func.sum(
            SalesData.net_qty
        ).desc()

    ).limit(20).all()

    fast_moving = [

        {
            "product": row[0],
            "sales": round(row[1],2)
        }

        for row in fast_moving_raw

        if row[0]

    ]

    # =========================
    # SLOW MOVING PRODUCTS
    # =========================

    slow_moving_raw = query.with_entities(

        SalesData.item_name,

        func.sum(
            SalesData.net_qty
        )

    ).group_by(

        SalesData.item_name

    ).order_by(

        func.sum(
            SalesData.net_qty
        ).asc()

    ).limit(20).all()

    slow_moving = [

        {
            "product": row[0],
            "sales": round(row[1],2)
        }

        for row in slow_moving_raw

        if row[0]

    ]

    # =========================
    # FILTER OPTIONS
    # =========================

    states = db.query(
        SalesData.state
    ).distinct().all()

    salespersons = db.query(
        SalesData.sales_person
    ).distinct().all()

    months = db.query(
        SalesData.month
    ).distinct().all()

    parties = db.query(
        SalesData.party_name
    ).distinct().all()

    products = db.query(
        SalesData.item_name
    ).distinct().all()

    # =========================
    # RETURN
    # =========================

    return {

        "kpis": {

            "totalSales":
                round(total_sales,2),

            "totalQtySold":
                round(total_qty,2),

            "avgMonthlySales":
                round(total_sales/12,2),

            "avgBillValue":
                round(avg_bill_value,2),

            "profitPercent":

                round(

                    (

                        (
                            total_sales -
                            total_cost
                        )

                        / total_cost

                    ) * 100,

                    2

                ) if total_cost else 0,

            "totalBills":
                total_bills,

            "totalCustomers":
                total_customers,

            "totalProducts":
                total_products

        },

        "monthlySales":
            monthly_sales,

        "momGrowth":
            mom_growth,

        "stateSales":
            state_sales,

        "topCustomers":
            top_customers,

        "topProducts":
            top_products,

        "salesPersonSales":
            sales_person_sales,

        "salesPersonCustomers":
            sales_person_customers,

        "newCustomers":
            new_customers,

        "repeatCustomers":
            repeat_customers,

        "fastMoving":
            fast_moving,

        "slowMoving":
            slow_moving,

        "filters": {

            "states":
                sorted(
                    [x[0] for x in states if x[0]]
                ),

            "salespersons":
                sorted(
                    [x[0] for x in salespersons if x[0]]
                ),

            "months":
                sorted(
                    [x[0] for x in months if x[0]],
                    key=lambda d:
                        datetime.strptime(
                            d,
                            "%b-%Y"
                        )
                ),

            "parties":
                sorted(
                    [x[0] for x in parties if x[0]]
                ),

            "products":
                sorted(
                    [x[0] for x in products if x[0]]
                )

        },

        "lastUpdated":

            str(

                db.query(
                    func.max(
                        SalesData.date
                    )
                ).scalar()

            )

    }