# datos.do — Dominican Republic Education Data Journalism

A data journalism website visualizing the evolution of education in the Dominican Republic, built with D3.js. Inspired by Mike Bostock / NYT graphics style: annotated, narrative-driven, scrollytelling.

## Project goal

Surface underreported education data about the Dominican Republic and compare it to Latin American peers. The DR has a compelling story: decades of underinvestment followed by a landmark 2013 budget law, and a PISA trajectory that went from last place to the only country in the region to improve across all subjects in 2022.

---

## Stories — Phase 1

### Story 1: "The 4% Moment"
> *How a law that existed for 15 years finally got enforced — and what happened to education spending.*

- **Core data:** Education spending as % of GDP (1970–2022), World Bank EdStats
- **Key annotation moment:** 2013 — Law 66-97 finally enforced, spending jumps from ~2% to ~4%
- **Secondary layer:** Budget allocated vs. budget actually executed (MINERD reports)
- **D3 chart type:** Annotated line chart with vertical event markers and shaded regions
- **Observable notebook:** `notebooks/4pct-spending.ojs`

### Story 2: "Last But Improving"
> *The Dominican Republic ranked last in PISA 2018. By 2022, it was the only country in Latin America to improve in math, reading, and science.*

- **Core data:** PISA scores 2015, 2018, 2022 for all 14 LAC participating countries
- **Key tension:** Starting from the bottom, but the only country moving in the right direction
- **Secondary layer:** Score vs. spending scatter to show money ≠ outcomes
- **D3 chart type:** Connected dot plot / slope chart + small multiple LAC comparison
- **Observable notebook:** `notebooks/pisa-trajectory.ojs`

---

## Tech stack

| Layer | Tool | Reason |
|---|---|---|
| Visualization | D3.js v7 | Full control, Bostock-style |
| Prototyping | Observable notebooks | Fast iteration before porting |
| Site | HTML + vanilla JS | No framework — keeps it portable |
| Scrollytelling | Scrollama.js | Lightweight, well-maintained |
| Hosting | GitHub Pages | Free, static, version-controlled |
| Data pipeline | Python (pandas) | Clean raw CSVs → chart-ready JSON |

**Development workflow:**
1. Prototype in Observable → validate data + visual logic
2. Export clean JSON from Observable
3. Port D3 code to standalone HTML/JS modules
4. Add scrollytelling layer with Scrollama
5. Deploy to GitHub Pages

---

## Folder structure

```
datos-do/
├── README.md                    ← You are here
├── CLAUDE.md                    ← Instructions for Claude Code
├── index.html                   ← Site homepage / story index
│
├── stories/
│   ├── 4pct-moment/
│   │   ├── index.html           ← Story page
│   │   ├── chart.js             ← D3 chart module
│   │   └── data.json            ← Chart-ready data (generated)
│   └── pisa-trajectory/
│       ├── index.html
│       ├── chart.js
│       └── data.json
│
├── notebooks/                   ← Observable prototypes (.ojs files or links)
│   ├── 4pct-spending.md         ← Observable notebook notes + embed link
│   └── pisa-trajectory.md
│
├── data/
│   ├── raw/                     ← Original downloaded files, never modified
│   │   ├── world-bank-education-DOM.csv
│   │   ├── pisa-2022-lac.csv
│   │   └── sources.md           ← Where each file came from + download date
│   ├── processed/               ← Cleaned, chart-ready (output of scripts)
│   │   ├── spending-gdp.json
│   │   └── pisa-lac-scores.json
│   └── scripts/
│       ├── clean-spending.py    ← World Bank CSV → spending JSON
│       └── clean-pisa.py        ← PISA CSV → LAC scores JSON
│
├── shared/
│   ├── style.css                ← Global styles (typography, layout, colors)
│   ├── d3.v7.min.js             ← D3 local copy
│   └── scrollama.min.js         ← Scrollama local copy
│
└── design/
    ├── palette.md               ← Color system + type scale
    └── references.md            ← Bostock / NYT pieces used as visual reference
```

---

## Data sources

### World Bank EdStats API
- **URL:** `https://api.worldbank.org/v2/country/DO/indicator/SE.XPD.TOTL.GD.ZS?format=json&per_page=100`
- **Indicator:** `SE.XPD.TOTL.GD.ZS` — Education spending % of GDP
- **Country code:** DOM
- **Coverage:** 1970–2022
- **Download as CSV:** `https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS?locations=DO`

### PISA 2022 (OECD)
- **Source:** OECD PISA database
- **Countries:** All 14 LAC participants (AR, BR, CL, CO, CR, DO, GT, JM, MX, PA, PY, PE, UY, SV)
- **Years available for DR:** 2015, 2018, 2022
- **Direct data:** `https://www.oecd.org/pisa/data/2022database/`
- **IDB summary dataset:** `https://publications.iadb.org/publications/english/document/Learning-cant-Wait-Lessons-for-Latin-America-and-the-Caribbean-from-PISA-2022.pdf`

### UNESCO UIS (backup / additional indicators)
- **Bulk download:** `https://databrowser.uis.unesco.org/`
- **API docs:** `https://api.uis.unesco.org/api/public/documentation`

---

## Design principles

- **Annotation over decoration** — every visual element should carry information
- **Mobile-first** — readable on phones, richer on desktop
- **Spanish + English** — labels and copy in both (DR audience matters)
- **Honest about gaps** — show data limitations directly in the visual
- **Serif headlines, sans body** — NYT editorial feel
- **Color:** One accent color per story, muted palette, high contrast text

---

## Key facts to encode in visuals

**Spending story:**
- 1993: historic low — 0.77% of GDP spent on education
- 1997: Law 66-97 passed, mandating 4% of GDP — not enforced
- 2013: law finally enforced, spending jumps to ~4%
- 2020: highest ever at 4.52% (pandemic year)
- 2022: 3.94% (slightly below target)
- Pattern: MINERD consistently under-executes its budget; funds get redirected

**PISA story:**
- 2015: DR joins PISA for Development (PISA-D)
- 2018: DR ranked 76th of 79 countries in reading; near last in all subjects
- 2022: DR improved +14pts math, +15pts reading, +25pts science vs 2018
- 2022: Only LAC country to improve in all three subjects
- 2022 math score: 339 points (DR) vs OECD avg 472 — equivalent to ~7 years behind
- Gender angle: Among poorest students in DR, girls outperform boys

---

## Observable notebook workflow

For each story, prototype in Observable first:

1. Go to `observablehq.com` → New notebook
2. Load data directly from World Bank API or uploaded CSV
3. Build the D3 chart iteratively
4. When satisfied: export the chart code as a JS module
5. Export the processed data as JSON
6. Save the notebook URL in `notebooks/[story-name].md`
7. Port the D3 code into `stories/[story-name]/chart.js`

Observable cell → standalone JS conversion notes:
- Replace `Plot.plot()` with `d3.select()` if using Observable Plot
- Replace `FileAttachment` with `d3.csv()` or `d3.json()`
- Replace reactive `${}` with explicit update functions
- Wrap in a `drawChart(container, data)` export function

---

## Phase 2 stories (backlog)

- **"A generation learns to read"** — literacy rate 1981–2022 (73% → 95.5%)
- **"The leaky pipeline"** — enrollment high, completion low (funnel/Sankey)
- **"Money ≠ scores"** — LAC spending vs PISA scatter plot
- **"Gender reversal"** — DR boys underperform girls unlike most LAC countries
- **"The private school boom"** — 11,296 schools in 2018, many in poor neighborhoods
