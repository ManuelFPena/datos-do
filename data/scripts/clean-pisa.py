"""
clean-pisa.py
Converts PISA LAC summary CSV → pisa-lac-scores.json for the PISA trajectory chart.

Run from: data/scripts/
Input:    data/raw/pisa-lac-summary.csv   (manually created — see sources.md)
Output:   data/processed/pisa-lac-scores.json
"""

import pandas as pd
import json
import sys
from pathlib import Path

RAW = Path("../raw/pisa-lac-summary.csv")
OUT = Path("../processed/pisa-lac-scores.json")

# Country display names (Spanish / bilingual)
COUNTRY_NAMES = {
    "DO": {"es": "República Dominicana", "en": "Dominican Republic"},
    "CL": {"es": "Chile", "en": "Chile"},
    "CO": {"es": "Colombia", "en": "Colombia"},
    "BR": {"es": "Brasil", "en": "Brazil"},
    "MX": {"es": "México", "en": "Mexico"},
    "AR": {"es": "Argentina", "en": "Argentina"},
    "PE": {"es": "Perú", "en": "Peru"},
    "UY": {"es": "Uruguay", "en": "Uruguay"},
    "CR": {"es": "Costa Rica", "en": "Costa Rica"},
    "PA": {"es": "Panamá", "en": "Panama"},
    "PY": {"es": "Paraguay", "en": "Paraguay"},
    "GT": {"es": "Guatemala", "en": "Guatemala"},
    "SV": {"es": "El Salvador", "en": "El Salvador"},
    "JM": {"es": "Jamaica", "en": "Jamaica"},
}

# OECD average for reference line
OECD_SCORES = [
    {"year": 2018, "math": 489, "reading": 487, "science": 489},
    {"year": 2022, "math": 472, "reading": 476, "science": 485},
]

# Countries to highlight in the chart
HIGHLIGHT = {"DO"}  # Dominican Republic is the main character


def main():
    try:
        df = pd.read_csv(RAW)
    except FileNotFoundError:
        print(f"ERROR: {RAW} not found.")
        print("Create this file manually — see data/raw/sources.md for the full CSV contents.")
        sys.exit(1)

    required_cols = {"country", "iso", "year", "math", "reading", "science"}
    if not required_cols.issubset(df.columns):
        print(f"ERROR: CSV missing columns. Expected: {required_cols}")
        print(f"Found: {set(df.columns)}")
        sys.exit(1)

    # Build per-country records
    output = []
    for iso, group in df.groupby("iso"):
        group = group.sort_values("year")
        scores = []
        for _, row in group.iterrows():
            scores.append({
                "year": int(row["year"]),
                "math": int(row["math"]),
                "reading": int(row["reading"]),
                "science": int(row["science"]),
            })

        names = COUNTRY_NAMES.get(iso, {"es": iso, "en": iso})
        record = {
            "iso": iso,
            "country_es": names["es"],
            "country_en": names["en"],
            "highlight": iso in HIGHLIGHT,
            "scores": scores,
        }

        # Compute change 2018→2022 if both years exist
        years_available = [s["year"] for s in scores]
        if 2018 in years_available and 2022 in years_available:
            s2018 = next(s for s in scores if s["year"] == 2018)
            s2022 = next(s for s in scores if s["year"] == 2022)
            record["change_2018_2022"] = {
                "math": s2022["math"] - s2018["math"],
                "reading": s2022["reading"] - s2018["reading"],
                "science": s2022["science"] - s2018["science"],
            }

        output.append(record)

    # Sort: DR first, then by 2022 math score descending
    def sort_key(r):
        if r["iso"] == "DO":
            return (0, 0)
        score_2022 = next((s["math"] for s in r["scores"] if s["year"] == 2022), 0)
        return (1, -score_2022)

    output.sort(key=sort_key)

    # Build final output with OECD reference
    final = {
        "countries": output,
        "oecd_reference": OECD_SCORES,
        "subjects": ["math", "reading", "science"],
        "years": sorted(df["year"].unique().tolist()),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(final, f, indent=2, ensure_ascii=False)

    print(f"Written {len(output)} countries to {OUT}")
    print(f"Years: {final['years']}")
    print("\nCountries included:")
    for r in output:
        flag = "★" if r["highlight"] else " "
        scores_str = ", ".join(f"{s['year']}: {s['math']}M" for s in r["scores"])
        print(f"  {flag} {r['iso']} — {scores_str}")


if __name__ == "__main__":
    main()
