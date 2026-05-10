import json
import subprocess

COUNTRIES = ["DO", "BR", "AR", "CL", "CO", "MX", "PE", "UY", "CR", "PA", "PY"]
YEARS     = {2011, 2014, 2017, 2021}
INDICATOR = "FX.OWN.TOTL.ZS"

NAMES_ES = {
    "DO": ("República Dominicana", "Dominican Republic"),
    "BR": ("Brasil",               "Brazil"),
    "AR": ("Argentina",            "Argentina"),
    "CL": ("Chile",                "Chile"),
    "CO": ("Colombia",             "Colombia"),
    "MX": ("México",               "Mexico"),
    "PE": ("Perú",                 "Peru"),
    "UY": ("Uruguay",              "Uruguay"),
    "CR": ("Costa Rica",           "Costa Rica"),
    "PA": ("Panamá",               "Panama"),
    "PY": ("Paraguay",             "Paraguay"),
}

def fetch_findex():
    iso_str = ";".join(COUNTRIES)
    url = (
        f"https://api.worldbank.org/v2/country/{iso_str}/indicator/{INDICATOR}"
        f"?format=json&per_page=500&date=2011:2021"
    )
    result = subprocess.run(["curl", "-s", url], capture_output=True, text=True, timeout=30)
    payload = json.loads(result.stdout)
    return payload[1]  # index 0 is pagination metadata

def build_output(raw):
    by_country = {iso: {} for iso in COUNTRIES}

    for row in raw:
        iso   = row["country"]["id"]
        year  = int(row["date"])
        value = row["value"]
        if iso in by_country and year in YEARS and value is not None:
            by_country[iso][year] = round(float(value), 2)

    countries_out = []
    for iso in COUNTRIES:
        vals = by_country[iso]
        name_es, name_en = NAMES_ES[iso]

        values_list = [
            {"year": yr, "value": vals[yr]}
            for yr in sorted(YEARS)
            if yr in vals
        ]

        entry = {
            "iso":        iso,
            "country_es": name_es,
            "country_en": name_en,
            "highlight":  iso == "DO",
            "values":     values_list,
        }

        v2017 = vals.get(2017)
        v2021 = vals.get(2021)
        if v2017 is not None and v2021 is not None:
            entry["change_2017_2021"] = round(v2021 - v2017, 2)

        countries_out.append(entry)

    return {"countries": countries_out}

if __name__ == "__main__":
    print("Fetching World Bank Findex data…")
    raw = fetch_findex()
    print(f"  Received {len(raw)} rows from API")

    output = build_output(raw)

    out_path = "../processed/findex-lac.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"  Written to {out_path}")
    print()
    for c in output["countries"]:
        chg = c.get("change_2017_2021", "n/a")
        print(f"  {c['iso']:3s}  {c['country_es']:<25s}  change 2017→2021: {chg}")
