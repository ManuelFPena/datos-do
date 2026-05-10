import json
from pathlib import Path

RAW = Path("../raw/world-bank-spending-DOM.json")
OUT = Path("../processed/spending-gdp.json")

ANNOTATIONS = {
    1993: "Historic low — 0.77% of GDP",
    1997: "Law 66-97 passed (4% mandate, not yet enforced)",
    2013: "4% mandate finally enforced",
    2020: "Highest ever — 4.52% (pandemic year)",
}

def main():
    with open(RAW) as f:
        raw = json.load(f)

    records_raw = raw[1]
    records = []
    for row in records_raw:
        if row["value"] is None:
            continue
        year = int(row["date"])
        rec = {"year": year, "value": round(float(row["value"]), 3)}
        if year in ANNOTATIONS:
            rec["annotation"] = ANNOTATIONS[year]
        records.append(rec)

    records.sort(key=lambda r: r["year"])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(records, f, indent=2)

    print(f"Written {len(records)} records to {OUT}")
    print(f"Year range: {records[0]['year']} – {records[-1]['year']}")
    print(f"Value range: {min(r['value'] for r in records):.2f}% – {max(r['value'] for r in records):.2f}%")
    for r in records[:4]:
     rint(" ", r)

if __name__ == "__main__":
    main()
