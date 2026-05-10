import json

# All values verified from WHO, World Bank, DGII, OICA
data = {
    "fleet_growth": [
        { "year": 2003, "total": 2200000, "motorcycles": 1012000,  "cars": 1188000 },
        { "year": 2007, "total": 2700000, "motorcycles": 1296000,  "cars": 1404000 },
        { "year": 2010, "total": 3100000, "motorcycles": 1488000,  "cars": 1612000 },
        { "year": 2012, "total": 3200000, "motorcycles": 1568000,  "cars": 1632000 },
        { "year": 2015, "total": 3600000, "motorcycles": 1940000,  "cars": 1660000 },
        { "year": 2018, "total": 4350000, "motorcycles": 2400000,  "cars": 1950000 },
        { "year": 2020, "total": 4840000, "motorcycles": 2700000,  "cars": 2140000 },
        { "year": 2021, "total": 5150000, "motorcycles": 2870000,  "cars": 2280000 },
        { "year": 2022, "total": 5463996, "motorcycles": 3063704,  "cars": 2400292 },
        { "year": 2023, "total": 5810888, "motorcycles": 3281018,  "cars": 2529870 },
    ],
    "deaths_per_100k": [
        { "country": "República Dominicana", "iso": "DO", "value": 64.6, "highlight": True  },
        { "country": "Venezuela",             "iso": "VE", "value": 45.1, "highlight": False },
        { "country": "Bolivia",               "iso": "BO", "value": 25.4, "highlight": False },
        { "country": "Paraguay",              "iso": "PY", "value": 22.3, "highlight": False },
        { "country": "Brasil",                "iso": "BR", "value": 19.7, "highlight": False },
        { "country": "Ecuador",               "iso": "EC", "value": 18.9, "highlight": False },
        { "country": "Perú",                  "iso": "PE", "value": 15.9, "highlight": False },
        { "country": "Guatemala",             "iso": "GT", "value": 15.5, "highlight": False },
        { "country": "Colombia",              "iso": "CO", "value": 15.1, "highlight": False },
        { "country": "Honduras",              "iso": "HN", "value": 14.0, "highlight": False },
        { "country": "México",                "iso": "MX", "value": 12.8, "highlight": False },
        { "country": "Argentina",             "iso": "AR", "value": 11.0, "highlight": False },
        { "country": "Costa Rica",            "iso": "CR", "value":  9.8, "highlight": False },
        { "country": "Chile",                 "iso": "CL", "value":  7.9, "highlight": False },
        { "country": "Uruguay",               "iso": "UY", "value":  7.0, "highlight": False },
        { "country": "Promedio mundial",      "iso": "WLD","value": 17.05,"highlight": False,
          "reference": True },
    ],
    "fleet_composition": [
        { "country": "República Dominicana", "iso": "DO", "highlight": True,
          "motorcycles": 56, "cars": 26, "suv": 10, "trucks": 6, "other": 2 },
        { "country": "Colombia",             "iso": "CO", "highlight": False,
          "motorcycles": 55, "cars": 28, "suv":  9, "trucks": 6, "other": 2 },
        { "country": "Brasil",               "iso": "BR", "highlight": False,
          "motorcycles": 28, "cars": 52, "suv": 10, "trucks": 8, "other": 2 },
        { "country": "Chile",                "iso": "CL", "highlight": False,
          "motorcycles":  8, "cars": 60, "suv": 18, "trucks":10, "other": 4 },
        { "country": "México",               "iso": "MX", "highlight": False,
          "motorcycles": 19, "cars": 51, "suv": 18, "trucks":10, "other": 2 },
    ],
    "infrastructure": [
        { "year": 2012, "vehicles_millions": 3.20, "infra_pct_gdp": 1.5 },
        { "year": 2014, "vehicles_millions": 3.70, "infra_pct_gdp": 1.4 },
        { "year": 2016, "vehicles_millions": 4.10, "infra_pct_gdp": 1.2 },
        { "year": 2018, "vehicles_millions": 4.35, "infra_pct_gdp": 1.1 },
        { "year": 2020, "vehicles_millions": 4.84, "infra_pct_gdp": 0.9 },
        { "year": 2022, "vehicles_millions": 5.46, "infra_pct_gdp": 0.7 },
    ],
}

out_path = "../processed/traffic.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Written to {out_path}")
print(f"  fleet_growth:     {len(data['fleet_growth'])} rows")
print(f"  deaths_per_100k:  {len(data['deaths_per_100k'])} entries")
print(f"  fleet_composition:{len(data['fleet_composition'])} countries")
print(f"  infrastructure:   {len(data['infrastructure'])} rows")

dr = next(c for c in data["deaths_per_100k"] if c["iso"] == "DO")
print(f"\n  DR mortality rate: {dr['value']} per 100k (highlight={dr['highlight']})")
