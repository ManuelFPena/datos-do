import json
import subprocess

LAC_ISOS = ["DO", "BR", "AR", "CL", "CO", "MX", "PE", "CR", "PA", "PY", "BO"]

NAMES_ES = {
    "DO": "República Dominicana",
    "BR": "Brasil",
    "AR": "Argentina",
    "CL": "Chile",
    "CO": "Colombia",
    "MX": "México",
    "PE": "Perú",
    "CR": "Costa Rica",
    "PA": "Panamá",
    "PY": "Paraguay",
    "BO": "Bolivia",
}

FINDEX_YEARS = {2011, 2014, 2017, 2021}

def curl_json(url):
    result = subprocess.run(["curl", "-s", url], capture_output=True, text=True, timeout=30)
    return json.loads(result.stdout)

def fetch_wb(indicator, isos, date_range="2000:2023"):
    iso_str = ";".join(isos) if isinstance(isos, list) else isos
    url = (
        f"https://api.worldbank.org/v2/country/{iso_str}/indicator/{indicator}"
        f"?format=json&per_page=500&date={date_range}"
    )
    payload = curl_json(url)
    return payload[1] if len(payload) > 1 and payload[1] else []

# ── Account ownership (FX.OWN.TOTL.ZS) ──────────────────────────────────────

print("Fetching account ownership (FX.OWN.TOTL.ZS)...")
findex_raw = fetch_wb("FX.OWN.TOTL.ZS", LAC_ISOS, "2011:2021")
print(f"  {len(findex_raw)} rows received")

by_iso = {iso: {} for iso in LAC_ISOS}
for row in findex_raw:
    iso  = row["country"]["id"]
    year = int(row["date"])
    val  = row["value"]
    if iso in by_iso and val is not None and year in FINDEX_YEARS:
        by_iso[iso][year] = round(float(val), 2)

# DR timeseries — all 4 survey years
dr_vals = by_iso["DO"]
dr_timeseries = [
    {"year": yr, "value": dr_vals[yr]}
    for yr in sorted(FINDEX_YEARS)
    if yr in dr_vals
]

# LAC slope — countries with both 2017 and 2021
lac_slope = []
for iso in LAC_ISOS:
    v = by_iso[iso]
    if 2017 not in v or 2021 not in v:
        print(f"  Skipping {iso}: missing 2017 or 2021 data")
        continue
    lac_slope.append({
        "iso":        iso,
        "country_es": NAMES_ES[iso],
        "highlight":  iso == "DO",
        "v2017":      v[2017],
        "v2021":      v[2021],
        "change":     round(v[2021] - v[2017], 2),
    })

# ── Breakdown 2021 (hardcoded from Findex 2021 report, DR subgroups) ─────────

breakdown_2021 = [
    {"group": "Hombres",       "value": 54, "category": "gender"},
    {"group": "Mujeres",       "value": 49, "category": "gender"},
    {"group": "40% más pobre", "value": 42, "category": "income"},
    {"group": "60% más rico",  "value": 66, "category": "income"},
]

# ── Remittances (BX.TRF.PWKR.CD.DT) ─────────────────────────────────────────

print("Fetching remittances (BX.TRF.PWKR.CD.DT)...")
remit_raw = fetch_wb("BX.TRF.PWKR.CD.DT", ["DO"], "2000:2023")
print(f"  {len(remit_raw)} rows received")

remit_by_year = {}
for row in remit_raw:
    if row["value"] is not None:
        remit_by_year[int(row["date"])] = round(float(row["value"]) / 1_000_000_000, 2)

remittances = [
    {"year": yr, "value": remit_by_year[yr]}
    for yr in sorted(remit_by_year)
]

# ── Output ────────────────────────────────────────────────────────────────────

output = {
    "dr_timeseries": dr_timeseries,
    "lac_slope":     lac_slope,
    "breakdown_2021": breakdown_2021,
    "remittances":   remittances,
}

out_path = "../processed/findex-expanded.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nWritten to {out_path}")
print(f"\nDR timeseries:  {dr_timeseries}")
print(f"LAC slope ({len(lac_slope)} countries):")
for c in lac_slope:
    print(f"  {c['iso']:3s} {c['country_es']:<25s} 2017:{c['v2017']:5.1f}% → 2021:{c['v2021']:5.1f}%  change:{c['change']:+.2f}")
print(f"Remittances:    {len(remittances)} years ({remittances[0]['year']}–{remittances[-1]['year']})")
