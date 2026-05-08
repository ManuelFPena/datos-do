# CLAUDE.md — Instructions for Claude Code

This file tells Claude Code how to work in this project. Read it fully before making any changes.

---

## What this project is

`datos.do` is a data journalism website about education in the Dominican Republic. It uses D3.js for visualizations in the style of Mike Bostock / NYT Graphics: annotated, minimal, narrative-driven.

The workflow is: **Observable notebook first → port to standalone HTML/JS**.

---

## File conventions

### Never modify files in `data/raw/`
These are original source files. If you need to clean or reshape data, write a script in `data/scripts/` and output to `data/processed/`.

### Chart modules must be self-contained
Each story's `chart.js` must export a single function:
```js
export function drawChart(container, data) { ... }
```
`container` is a DOM element. `data` is the processed JSON. No globals.

### JSON data shape — spending chart
```json
[
  { "year": 2013, "value": 3.97, "annotation": "4% law enforced" },
  { "year": 1993, "value": 0.77, "annotation": "Historic low" }
]
```
Annotations are optional. Only add them for the key moments defined in README.md.

### JSON data shape — PISA chart
```json
[
  {
    "country": "Dominican Republic",
    "iso": "DO",
    "highlight": true,
    "scores": [
      { "year": 2015, "math": 328, "reading": 358, "science": 332 },
      { "year": 2018, "math": 325, "reading": 342, "science": 336 },
      { "year": 2022, "math": 339, "reading": 357, "science": 361 }
    ]
  }
]
```

---

## D3 style guide

Follow Bostock conventions:

```js
// Margins
const margin = { top: 40, right: 60, bottom: 40, left: 50 };
const width = container.clientWidth - margin.left - margin.right;
const height = 420 - margin.top - margin.bottom;

// SVG setup
const svg = d3.select(container)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
```

- Use `d3.scaleLinear()`, `d3.scaleTime()`, never hardcoded pixel values
- Axes: minimal ticks, no box borders, bottom + left only
- Colors: use the palette defined in `design/palette.md`
- Annotations: use `d3-annotation` library or hand-placed `<text>` + `<line>` elements
- Transitions: 600ms ease, only on data updates — not on initial render

---

## Python data scripts

Use pandas. Scripts live in `data/scripts/`. Each script:
1. Reads from `data/raw/`
2. Cleans and reshapes
3. Writes to `data/processed/` as JSON

Example:
```python
import pandas as pd
import json

df = pd.read_csv('../raw/world-bank-education-DOM.csv', skiprows=4)
# ... cleaning ...
df.to_json('../processed/spending-gdp.json', orient='records')
```

Run scripts from within `data/scripts/`:
```bash
cd data/scripts
python clean-spending.py
```

---

## HTML story page structure

Each story page follows this template:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Story title] — datos.do</title>
  <link rel="stylesheet" href="../../shared/style.css">
</head>
<body>
  <header class="story-header">
    <a href="../../index.html" class="back-link">← datos.do</a>
    <div class="dek">[Category label, e.g. "Educación"]</div>
    <h1>[Headline]</h1>
    <p class="subhed">[Two-sentence summary]</p>
    <p class="byline">Manuel F. Peña · [Year]</p>
  </header>

  <section class="story-body">
    <p>[Lede paragraph]</p>
  </section>

  <section class="chart-section">
    <div id="chart-container"></div>
    <p class="chart-note">Fuente: World Bank EdStats / OECD PISA</p>
  </section>

  <script type="module">
    import { drawChart } from './chart.js';
    import data from './data.json' assert { type: 'json' };
    drawChart(document.getElementById('chart-container'), data);
  </script>
</body>
</html>
```

---

## CSS conventions

Global styles are in `shared/style.css`. Do not add story-specific styles inline — add a `<link>` to `shared/style.css` and add story-specific overrides in a `story.css` file if needed.

Type scale:
- Headlines: `font-family: Georgia, serif; font-size: clamp(1.75rem, 4vw, 2.5rem)`
- Body: `font-family: system-ui, sans-serif; font-size: 1rem; line-height: 1.7`
- Chart labels: `font-size: 0.75rem; fill: #666`
- Annotations: `font-size: 0.7rem; fill: #333`

---

## What to build next (in order)

1. **`data/raw/sources.md`** — document every raw data file
2. **`data/scripts/clean-spending.py`** — World Bank CSV → `spending-gdp.json`
3. **`data/scripts/clean-pisa.py`** — PISA CSV → `pisa-lac-scores.json`
4. **`shared/style.css`** — global typography and layout
5. **`stories/4pct-moment/chart.js`** — spending line chart
6. **`stories/pisa-trajectory/chart.js`** — PISA slope chart
7. **`index.html`** — homepage linking to both stories

Do not build the homepage until both chart modules render correctly with real data.

---

## Data download instructions

### World Bank spending data
```bash
curl "https://api.worldbank.org/v2/country/DO/indicator/SE.XPD.TOTL.GD.ZS?format=json&per_page=100&mrv=60" \
  -o data/raw/world-bank-spending-DOM.json
```
Or download CSV manually from: `https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS?locations=DO`
Save as: `data/raw/world-bank-education-DOM.csv`

### PISA LAC scores
Manual download from OECD:
- URL: `https://www.oecd.org/pisa/data/2022database/`
- File needed: Country mean scores table (Excel)
- Save as: `data/raw/pisa-2022-country-means.xlsx`

For DR-specific 2015 and 2018: use the IDB summary report data which is already tabulated in the README.

### LAC comparison countries
ISO codes for the 14 LAC PISA 2022 participants:
`AR, BR, CL, CO, CR, DO, GT, JM, MX, PA, PY, PE, UY, SV`

---

## GitHub Pages setup (when ready to deploy)

```bash
# In repo root
git init
git remote add origin https://github.com/ManuelFPena/datos-do.git
git checkout -b main
git add .
git commit -m "initial project scaffold"
git push -u origin main
```

Then in GitHub repo settings: Pages → Deploy from branch → `main` → `/root`

The site will be live at: `https://manuelFPena.github.io/datos-do/`

---

## Do not

- Do not use any JS framework (React, Vue, Svelte) in the final site files
- Do not use Observable Plot — use core D3.js for all final charts
- Do not hardcode pixel sizes — use responsive scales
- Do not add analytics, cookies, or tracking of any kind
- Do not modify files in `data/raw/`
- Do not commit API keys or personal data
