# Notebook: El momento del 4%

## Observable prototype

Notebook URL: *(not yet published — prototype in progress)*

## Data source

World Bank EdStats API — indicator `SE.XPD.TOTL.GD.ZS`
- Country: Dominican Republic (DO / DOM)
- Coverage: 1970–2023
- Raw file: `data/raw/world-bank-spending-DOM.json`
- Processed: `data/processed/spending-gdp.json`

## Key decisions made in prototype

- **Year range:** 1970–2023. Gap years (no WB data) are dropped; the line is connected only across defined points (`d3.line().defined()`).
- **Annotations:** Three moments — 1993 historic low (0.77%), 2013 law enforced (3.63%), 2020 pandemic peak (4.52%).
- **1997 law marker:** Vertical dashed line marking when Ley 66-97 was passed (not enforced until 2013).
- **4% threshold line:** Horizontal dashed reference at y = 4%.
- **Shaded region:** Light red fill from 2013 onward to visually anchor the enforcement period.

## Chart type

Annotated line chart. Single country. Emphasis on the structural break in 2013.

## Ported to

`stories/4pct-moment/chart.js` — standalone D3 ES module.
