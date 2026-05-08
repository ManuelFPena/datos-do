"""
clean-spending.py
Converts World Bank EdStats CSV → spending-gdp.json for the 4% Moment chart.

Run from: data/scripts/
Input:    data/raw/world-bank-education-DOM.csv
Output:   data/processed/spending-gdp.json
"""

import pandas as pd
import json
import sys
from pathlib import Path

RAW = Path("../raw/world-bank-education-DOM.csv")
OUT = Path("../processed/spending-gdp.json")

# Key annotation moments for the chart
ANNOTATIONS = {
    1993: "Historic low — 0.77% of GDP",
    1997: "Law 66-97 passed (4% mandate, not yet enforced)",
    2013: "4% mandate finally enforced",
    2020: "Highest ever — 4.52% (pandemic year)",
}

def load_world_bank_csv(path):
    """
    World Bank CSV format has 4 header rows before the actual data.
    Years are columns, countries are rows.
    """
    try:
        df = pd.read_csv(path, skiprows=4)
    except FileNotFoundError:
        print(f"ERROR: {path} not found.")
        print("Download from: https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS?locations=DO")
        sys.exit(1)

    # Filter to Dominican Republic row
    dr = df[df["Country Code"] == "DOM"].copy()
    if dr.empty:
        print("ERROR: Dominican Republic (DOM) not found in CSV.")
        sys.exit(1)

    # Melt year columns into rows
    year_cols = [c for c in df.columns if c.isdigit()]
    dr_melted = dr[year_cols].melt(var_name="year", value_name="value")
    dr_melted["year"] = dr_melted["year"].astype(int)
    dr_melted["value"] = pd.to_numeric(dr_melted["value"], errors="coerce")

    # Drop years with no data
    dr_melted = dr_melted.dropna(subset=["value"])
    dr_melted = dr_melted.sort_values("year").reset_index(drop=True)

    return dr_melted


def build_output(df):
    records = []
    for _, row in df.iterrows():
        year = int(row["year"])
        rec = {
            "year": year,
            "value": round(float(row["value"]), 3),
        }
        if year in ANNOTATIONS:
            rec["annotation"] = ANNOTATIONS[year]
        records.append(rec)
    return records


def main():
    print(f"Reading {RAW}...")
    df = load_world_bank_csv(RAW)
    print(f"Found {len(df)} data points for Dominican Republic")
    print(f"Year range: {df['year'].min()} – {df['year'].max()}")
    print(f"Value range: {df['value'].min():.2f}% – {df['value'].max():.2f}%")

    records = build_output(df)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print(f"\nWritten {len(records)} records to {OUT}")
    print("\nSample output:")
    for r in records[:3]:
        print(" ", r)


if __name__ == "__main__":
    main()
