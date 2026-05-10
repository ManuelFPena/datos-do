# Notebook: Último, pero mejorando

## Observable prototype

Notebook URL: *(not yet published — prototype in progress)*

## Data source

OECD PISA 2022 — country mean scores for LAC participants
- Raw file: `data/raw/pisa-lac-summary.csv`
- Processed: `data/processed/pisa-lac-scores.json`
- Countries: 14 LAC PISA 2022 participants (AR, BR, CL, CO, CR, DO, GT, JM, MX, PA, PY, PE, UY, SV)
- DR has data for 2015, 2018, 2022. Most other countries only 2018 + 2022.

## Key decisions made in prototype

- **Chart type:** Slope chart (connected dot plot), 2018 → 2022.
- **Default subject shown:** Reading. The DR story is consistent across all three subjects.
- **DR treatment:** Bold indigo line, large dots, labeled at both ends.
- **Other countries:** Light gray, unlabeled — context, not focus.
- **OECD reference:** Dashed gray line showing the OECD average trajectory (also fell 2018→2022).
- **2015 excluded from slope:** The 2015 DR scores are PISA-D (different methodology) and can't be directly compared. Mentioned in copy only.

## The story

DR was unique in LAC: every other country either stayed flat or declined. DR improved in all three subjects simultaneously — the only country in the region to do so.

## Ported to

`stories/pisa-trajectory/chart.js` — standalone D3 ES module.
