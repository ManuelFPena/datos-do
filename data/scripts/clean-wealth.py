import json
import os

data = {
    "income_distribution": [
        {"group": "Top 1%", "share": 30.5, "population_pct": 1, "order": 1},
        {"group": "Siguiente 9%", "share": 24.5, "population_pct": 9, "order": 2},
        {"group": "Medio 40%", "share": 28.0, "population_pct": 40, "order": 3},
        {"group": "Bottom 50%", "share": 17.0, "population_pct": 50, "order": 4}
    ],
    "global_comparison": [
        {"country": "República Dominicana", "iso": "DO", "highlight": True,
         "top10_share": 55.0, "top1_share": 30.5},
        {"country": "Brasil", "iso": "BR", "highlight": False,
         "top10_share": 59.0, "top1_share": 28.0},
        {"country": "Colombia", "iso": "CO", "highlight": False,
         "top10_share": 57.0, "top1_share": 27.0},
        {"country": "México", "iso": "MX", "highlight": False,
         "top10_share": 58.0, "top1_share": 27.5},
        {"country": "Chile", "iso": "CL", "highlight": False,
         "top10_share": 53.0, "top1_share": 23.0},
        {"country": "Perú", "iso": "PE", "highlight": False,
         "top10_share": 54.0, "top1_share": 26.0},
        {"country": "Argentina", "iso": "AR", "highlight": False,
         "top10_share": 45.0, "top1_share": 20.0},
        {"country": "Uruguay", "iso": "UY", "highlight": False,
         "top10_share": 38.0, "top1_share": 16.0},
        {"country": "Costa Rica", "iso": "CR", "highlight": False,
         "top10_share": 40.0, "top1_share": 18.0},
        {"country": "Estados Unidos", "iso": "US", "highlight": False,
         "top10_share": 47.0, "top1_share": 19.0},
        {"country": "Alemania", "iso": "DE", "highlight": False,
         "top10_share": 36.0, "top1_share": 13.0},
        {"country": "Países Nórdicos (prom.)", "iso": "NOR", "highlight": False,
         "top10_share": 27.0, "top1_share": 8.0}
    ],
    "informality_education": [
        {"education": "Sin educación", "formal_pct": 12, "informal_pct": 88},
        {"education": "Primaria", "formal_pct": 24, "informal_pct": 76},
        {"education": "Secundaria", "formal_pct": 42, "informal_pct": 58},
        {"education": "Técnico/Vocacional", "formal_pct": 61, "informal_pct": 39},
        {"education": "Universidad", "formal_pct": 73, "informal_pct": 27}
    ],
    "tax_gap": [
        {"label": "Recaudación real (% PIB)", "value": 13.2, "type": "actual"},
        {"label": "Promedio LAC (% PIB)", "value": 23.1, "type": "lac_avg"},
        {"label": "Promedio OCDE (% PIB)", "value": 34.3, "type": "oecd_avg"},
        {"label": "Ingresos perdidos por evasión (% PIB)", "value": 9.5, "type": "evasion"}
    ],
    "survey_capture": [
        {"year": 2012, "survey_pct": 48},
        {"year": 2013, "survey_pct": 46},
        {"year": 2014, "survey_pct": 44},
        {"year": 2015, "survey_pct": 42},
        {"year": 2016, "survey_pct": 41},
        {"year": 2017, "survey_pct": 40},
        {"year": 2018, "survey_pct": 40},
        {"year": 2019, "survey_pct": 39}
    ]
}

out_processed = os.path.join(os.path.dirname(__file__), "../processed/wealth.json")
out_story     = os.path.join(os.path.dirname(__file__), "../../stories/wealth-concentration/data.json")

for path in [out_processed, out_story]:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Written: {os.path.abspath(path)}")
