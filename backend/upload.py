import pandas as pd

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import SalesData

router = APIRouter()


@router.post("/upload")
async def upload_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # =========================
    # READ EXCEL
    # =========================

    df = pd.read_excel(
        file.file,
        engine="openpyxl"
    )

    # =========================
    # CLEAN COLUMN NAMES
    # =========================

    df.columns = [
        str(col).strip()
        for col in df.columns
    ]

    # =========================
    # REQUIRED COLUMNS
    # =========================

    required_columns = [
        "Party Name",
        "District",
        "State",
        "Item Name",
        "Bill No.",
        "Date",
        "Expiry Date",
        "Qty",
        "Free Qty",
        "NET QTY",
        "Rate",
        "Discount",
        "Amount",
        "MRP",
        "Cost",
        "Cost Amt",
        "Sales Person"
    ]

    missing_columns = [
        col
        for col in required_columns
        if col not in df.columns
    ]

    if missing_columns:
        return {
            "success": False,
            "message": "Missing required columns",
            "missing_columns": missing_columns
        }

    # =========================
    # REMOVE EMPTY ROWS
    # =========================

    df = df.dropna(how="all")

    # =========================
    # DATE CONVERSION
    # =========================

    df["Date"] = pd.to_datetime(
        df["Date"],
        errors="coerce"
    )

    df["Expiry Date"] = pd.to_datetime(
        df["Expiry Date"],
        errors="coerce"
    )

    # =========================
    # MONTH
    # =========================

    df["Month"] = df["Date"].dt.strftime(
        "%b-%Y"
    )

    # =========================
    # NUMERIC COLUMNS
    # =========================

    numeric_columns = [
        "Qty",
        "Free Qty",
        "NET QTY",
        "Rate",
        "Discount",
        "Amount",
        "MRP",
        "Cost",
        "Cost Amt"
    ]

    for col in numeric_columns:
        df[col] = pd.to_numeric(
            df[col],
            errors="coerce"
        ).fillna(0)

    # =========================
    # PROFIT
    # =========================

    df["Profit"] = (
        df["Amount"]
        - df["Cost Amt"]
    )

    # =========================
    # PROFIT %
    # =========================

    df["Profit %"] = (
        df["Profit"]
        /
        df["Cost Amt"].replace(0, 1)
    ) * 100

    # =========================
    # AVG MONTHLY SALES
    # =========================

    party_total_sales = (
        df.groupby("Party Name")["Amount"]
        .sum()
        .to_dict()
    )

    party_months = (
        df.groupby("Party Name")["Month"]
        .nunique()
        .to_dict()
    )

    # =========================
    # INSERT
    # =========================

    inserted = 0

    for _, row in df.iterrows():

        existing = db.query(
            SalesData
        ).filter(
            SalesData.bill_no == str(row["Bill No."]),
            SalesData.item_name == str(row["Item Name"]),
            SalesData.party_name == str(row["Party Name"])
        ).first()

        if existing:
            continue

        avg_sales = (
            party_total_sales[
                row["Party Name"]
            ]
            /
            max(
                1,
                party_months[
                    row["Party Name"]
                ]
            )
        )

        sales = SalesData(

            party_name=str(row["Party Name"]),
            district=str(row["District"]),
            state=str(row["State"]),
            item_name=str(row["Item Name"]),
            bill_no=str(row["Bill No."]),

            month=str(row["Month"]),
            date=row["Date"],
            expiry_date=row["Expiry Date"],

            qty=float(row["Qty"]),
            free_qty=float(row["Free Qty"]),
            net_qty=float(row["NET QTY"]),

            rate=float(row["Rate"]),
            discount=float(row["Discount"]),
            amount=float(row["Amount"]),

            mrp=float(row["MRP"]),

            cost=float(row["Cost"]),
            cost_amt=float(row["Cost Amt"]),

            avg_sales=float(avg_sales),

            sales_person=str(row["Sales Person"]),

            profit=float(row["Profit"]),
            profit_percent=float(row["Profit %"])

        )

        db.add(sales)

        inserted += 1

    # =========================
    # COMMIT
    # =========================

    db.commit()

    # =========================
    # RESPONSE
    # =========================

    last_date = df["Date"].max()

    return {
        "success": True,
        "message": "Upload Successful",
        "rows_inserted": inserted,
        "last_updated_date": (
            last_date.strftime("%d-%b-%Y")
            if pd.notnull(last_date)
            else None
        )
    }
