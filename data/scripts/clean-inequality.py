import json, os

out_dir = os.path.join(os.path.dirname(__file__), '..', 'processed')

# ── 1. Gini trend for Dominican Republic ──────────────────────────────────────
# Source: World Bank PovcalNet / WDI — SI.POV.GINI
# Reference lines: LAC average ~46 (2000), declining to ~45 (2022); OECD ~33
gini_trend = [
    {"year": 1996, "value": 48.7},
    {"year": 2000, "value": 51.7},
    {"year": 2002, "value": 52.1},
    {"year": 2004, "value": 50.0},
    {"year": 2006, "value": 50.5},
    {"year": 2008, "value": 48.3},
    {"year": 2010, "value": 47.2},
    {"year": 2012, "value": 47.1},
    {"year": 2014, "value": 44.0},
    {"year": 2016, "value": 43.7},
    {"year": 2018, "value": 41.9},
    {"year": 2020, "value": 40.5},
    {"year": 2022, "value": 39.6},
    {"year": 2024, "value": 39.0}
]

lac_gini_ref = [
    {"year": 1996, "value": 53.0},
    {"year": 2000, "value": 54.0},
    {"year": 2004, "value": 54.5},
    {"year": 2008, "value": 52.0},
    {"year": 2012, "value": 50.0},
    {"year": 2016, "value": 48.5},
    {"year": 2020, "value": 47.8},
    {"year": 2024, "value": 47.0}
]

oecd_gini_ref = [
    {"year": 1996, "value": 30.5},
    {"year": 2000, "value": 31.0},
    {"year": 2004, "value": 31.2},
    {"year": 2008, "value": 31.5},
    {"year": 2012, "value": 32.0},
    {"year": 2016, "value": 32.2},
    {"year": 2020, "value": 32.5},
    {"year": 2024, "value": 32.7}
]

# ── 2. Income shares by quintile — 4 countries ───────────────────────────────
# Source: World Bank WDI — SI.DST.xx.xx series, circa 2021-2022
income_shares = [
    {
        "country": "República Dominicana", "iso": "DO", "highlight": True,
        "shares": [
            {"quintile": "Q1", "label": "Más pobre", "share": 3.8},
            {"quintile": "Q2", "label": "", "share": 8.2},
            {"quintile": "Q3", "label": "", "share": 13.5},
            {"quintile": "Q4", "label": "", "share": 21.8},
            {"quintile": "Q5", "label": "Más rico", "share": 52.7}
        ]
    },
    {
        "country": "Uruguay", "iso": "UY", "highlight": False,
        "shares": [
            {"quintile": "Q1", "label": "Más pobre", "share": 7.1},
            {"quintile": "Q2", "label": "", "share": 11.8},
            {"quintile": "Q3", "label": "", "share": 16.6},
            {"quintile": "Q4", "label": "", "share": 23.5},
            {"quintile": "Q5", "label": "Más rico", "share": 41.0}
        ]
    },
    {
        "country": "Colombia", "iso": "CO", "highlight": False,
        "shares": [
            {"quintile": "Q1", "label": "Más pobre", "share": 3.5},
            {"quintile": "Q2", "label": "", "share": 7.0},
            {"quintile": "Q3", "label": "", "share": 11.9},
            {"quintile": "Q4", "label": "", "share": 20.4},
            {"quintile": "Q5", "label": "Más rico", "share": 57.2}
        ]
    },
    {
        "country": "Chile", "iso": "CL", "highlight": False,
        "shares": [
            {"quintile": "Q1", "label": "Más pobre", "share": 4.0},
            {"quintile": "Q2", "label": "", "share": 8.7},
            {"quintile": "Q3", "label": "", "share": 14.1},
            {"quintile": "Q4", "label": "", "share": 22.5},
            {"quintile": "Q5", "label": "Más rico", "share": 50.7}
        ]
    }
]

# ── 3. PISA 2022 scores by SES quintile — Dominican Republic ─────────────────
# Source: OECD PISA 2022 — Table II.B1.4.2 (estimated from national report)
pisa_by_ses = [
    {"quintile": 1, "label": "Quintil 1\n(más pobre)", "score": 298},
    {"quintile": 2, "label": "Quintil 2", "score": 316},
    {"quintile": 3, "label": "Quintil 3", "score": 332},
    {"quintile": 4, "label": "Quintil 4", "score": 354},
    {"quintile": 5, "label": "Quintil 5\n(más rico)", "score": 387}
]

# ── 4. LAC bubble chart: Gini × PISA math × traffic deaths × banking ─────────
# Sources: World Bank WDI, OECD PISA 2022, WHO 2019, Global Findex 2021
lac_bubble = [
    {"country": "República Dominicana", "iso": "DO", "highlight": True,
     "gini": 39.0, "pisa_math": 339, "traffic_deaths": 64.6, "banking_pct": 51.3},
    {"country": "Uruguay", "iso": "UY", "highlight": False,
     "gini": 40.6, "pisa_math": 409, "traffic_deaths": 15.7, "banking_pct": 64.5},
    {"country": "Chile", "iso": "CL", "highlight": False,
     "gini": 44.9, "pisa_math": 412, "traffic_deaths": 12.3, "banking_pct": 74.3},
    {"country": "Costa Rica", "iso": "CR", "highlight": False,
     "gini": 48.0, "pisa_math": 385, "traffic_deaths": 14.2, "banking_pct": 68.2},
    {"country": "México", "iso": "MX", "highlight": False,
     "gini": 45.4, "pisa_math": 395, "traffic_deaths": 18.0, "banking_pct": 49.1},
    {"country": "Perú", "iso": "PE", "highlight": False,
     "gini": 40.2, "pisa_math": 391, "traffic_deaths": 13.9, "banking_pct": 57.7},
    {"country": "Colombia", "iso": "CO", "highlight": False,
     "gini": 54.8, "pisa_math": 383, "traffic_deaths": 17.3, "banking_pct": 55.1},
    {"country": "Brasil", "iso": "BR", "highlight": False,
     "gini": 52.9, "pisa_math": 379, "traffic_deaths": 19.7, "banking_pct": 84.0},
    {"country": "Argentina", "iso": "AR", "highlight": False,
     "gini": 42.9, "pisa_math": 378, "traffic_deaths": 14.1, "banking_pct": 72.4},
    {"country": "Paraguay", "iso": "PY", "highlight": False,
     "gini": 45.7, "pisa_math": 358, "traffic_deaths": 22.0, "banking_pct": 36.9},
    {"country": "Panamá", "iso": "PA", "highlight": False,
     "gini": 49.8, "pisa_math": 374, "traffic_deaths": 15.8, "banking_pct": 46.4},
]

# ── 5. GDP per capita vs bottom-50 income share, DR 2000–2022 ────────────────
# Source: World Bank WDI (NY.GDP.PCAP.CD), World Inequality Database
growth_vs_bottom = [
    {"year": 2000, "gdp_per_capita": 2459, "bottom50_share": 14.5},
    {"year": 2002, "gdp_per_capita": 2614, "bottom50_share": 14.2},
    {"year": 2004, "gdp_per_capita": 2743, "bottom50_share": 14.0},
    {"year": 2006, "gdp_per_capita": 3451, "bottom50_share": 13.8},
    {"year": 2008, "gdp_per_capita": 4142, "bottom50_share": 14.5},
    {"year": 2010, "gdp_per_capita": 5023, "bottom50_share": 14.8},
    {"year": 2012, "gdp_per_capita": 5741, "bottom50_share": 15.2},
    {"year": 2014, "gdp_per_capita": 6348, "bottom50_share": 15.9},
    {"year": 2016, "gdp_per_capita": 7145, "bottom50_share": 16.2},
    {"year": 2018, "gdp_per_capita": 8004, "bottom50_share": 16.5},
    {"year": 2020, "gdp_per_capita": 7612, "bottom50_share": 16.0},
    {"year": 2022, "gdp_per_capita": 9423, "bottom50_share": 16.8}
]

# ── Write output ──────────────────────────────────────────────────────────────
output = {
    "gini_trend": gini_trend,
    "lac_gini_ref": lac_gini_ref,
    "oecd_gini_ref": oecd_gini_ref,
    "income_shares": income_shares,
    "pisa_by_ses": pisa_by_ses,
    "lac_bubble": lac_bubble,
    "growth_vs_bottom": growth_vs_bottom
}

out_path = os.path.join(out_dir, 'inequality.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Written: {out_path}")
print(f"  gini_trend:      {len(gini_trend)} entries")
print(f"  income_shares:   {len(income_shares)} countries")
print(f"  pisa_by_ses:     {len(pisa_by_ses)} quintiles")
print(f"  lac_bubble:      {len(lac_bubble)} countries")
print(f"  growth_vs_bottom:{len(growth_vs_bottom)} years")
