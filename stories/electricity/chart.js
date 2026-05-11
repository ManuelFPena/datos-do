import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const AMBER    = "#e67e22";
const RED_DARK = "#c0392b";
const BLUE     = "#1a5276";
const GREEN    = "#27ae60";
const BLUE_MED = "#2471a3";
const GREY     = "#ccc";

// ── helpers ──────────────────────────────────────────────────────────────────

function removeDomain(svg) {
  svg.selectAll(".axis .domain").remove();
  svg.selectAll(".axis .tick line").attr("stroke", "#e5e5e5");
}

// ── Chart 1: Dual Y-axis — losses % + subsidy USD bn ─────────────────────────
export function drawChart1(container, data) {
  const margin = { top: 55, right: 82, bottom: 40, left: 52 };
  const width  = Math.min(container.clientWidth, 860) - margin.left - margin.right;
  const height = 420 - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([1991, 2026]).range([0, width]);

  const yLoss    = d3.scaleLinear().domain([0, 45]).range([height, 0]);
  const ySubsidy = d3.scaleLinear().domain([0, 2.5]).range([height, 0]);

  // ── shaded regions ──
  svg.append("rect")
    .attr("x", x(2021)).attr("y", 0)
    .attr("width",  Math.max(0, x(2023) - x(2021)))
    .attr("height", height)
    .attr("fill", GREEN).attr("opacity", 0.07);

  svg.append("rect")
    .attr("x", x(2024)).attr("y", 0)
    .attr("width",  Math.max(0, x(2026) - x(2024)))
    .attr("height", height)
    .attr("fill", RED_DARK).attr("opacity", 0.07);

  // region labels
  svg.append("text")
    .attr("x", (x(2021) + x(2023)) / 2)
    .attr("y", 8)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.58rem")
    .attr("fill", GREEN)
    .attr("opacity", 0.85)
    .text("Período de relativa estabilidad");

  svg.append("text")
    .attr("x", (x(2024) + x(2026)) / 2)
    .attr("y", 8)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.58rem")
    .attr("fill", RED_DARK)
    .attr("opacity", 0.85)
    .text("Apagones nacionales regresan");

  // ── axes ──
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(8).tickSize(0).tickPadding(8));

  svg.append("g").attr("class", "axis axis-left")
    .call(d3.axisLeft(yLoss).ticks(5).tickFormat(d => `${d}%`).tickSize(-width).tickPadding(8));

  svg.append("g").attr("class", "axis axis-right")
    .attr("transform", `translate(${width},0)`)
    .call(d3.axisRight(ySubsidy).ticks(5).tickFormat(d => `$${d}B`).tickSize(0).tickPadding(8));

  removeDomain(svg);

  // ── axis labels ──
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", -40)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.7rem").attr("fill", AMBER)
    .text("Pérdidas eléctricas (%)");

  svg.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", height / 2).attr("y", -(width + 64))
    .attr("text-anchor", "middle")
    .attr("font-size", "0.7rem").attr("fill", RED_DARK)
    .text("Subsidio gubernamental (USD miles de millones)");

  // ── lines ──
  const lossLine = d3.line()
    .x(d => x(d.year)).y(d => yLoss(d.losses_pct))
    .curve(d3.curveMonotoneX);

  const subsidyLine = d3.line()
    .x(d => x(d.year)).y(d => ySubsidy(d.subsidy_usd_bn))
    .curve(d3.curveMonotoneX);

  // losses — animate with stroke-dashoffset
  const lossPath = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", AMBER)
    .attr("stroke-width", 2.5)
    .attr("d", lossLine);

  const lossLen = lossPath.node().getTotalLength();
  lossPath
    .attr("stroke-dasharray", `${lossLen} ${lossLen}`)
    .attr("stroke-dashoffset", lossLen)
    .transition().duration(900).ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0);

  // subsidy — animate with growing clip rect (preserves dash pattern)
  const clipId = "clip-subsidy-" + Math.random().toString(36).slice(2, 8);
  const clipRect = svg.append("defs").append("clipPath").attr("id", clipId)
    .append("rect")
    .attr("x", 0).attr("y", -10).attr("width", 0).attr("height", height + 20);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", RED_DARK)
    .attr("stroke-width", 1.8)
    .attr("stroke-dasharray", "6 4")
    .attr("opacity", 0.8)
    .attr("clip-path", `url(#${clipId})`)
    .attr("d", subsidyLine);

  clipRect.transition().delay(120).duration(900).ease(d3.easeCubicOut)
    .attr("width", width + 10);

  // ── annotated dots (all 9 annotated points) ──
  const annotated = data.filter(d => d.annotation);

  svg.selectAll(".ann-dot")
    .data(annotated)
    .join("circle")
    .attr("class", "ann-dot")
    .attr("cx", d => x(d.year))
    .attr("cy", d => yLoss(d.losses_pct))
    .attr("r", 4)
    .attr("fill", AMBER)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  // ── text labels: 5 pre-2020 annotations only (rest covered by shaded regions) ──
  const textAnnotations = [
    { year: 1991, lines: ["40% energía no servida"], above: true,  anchor: "middle" },
    { year: 1998, lines: ["Intento de", "privatización"],           above: false, anchor: "middle" },
    { year: 2002, lines: ["Reforma: pérdidas", "caen a 11%"],       above: true,  anchor: "middle" },
    { year: 2003, lines: ["Crisis bancaria —", "colapso"],          above: false, anchor: "middle" },
    { year: 2008, lines: ["Subsidios >$1B", "3% del PIB"],          above: true,  anchor: "end" },
  ];

  textAnnotations.forEach(a => {
    const dataPoint = annotated.find(d => d.year === a.year);
    if (!dataPoint) return;
    const cx = x(a.year);
    const cy = yLoss(dataPoint.losses_pct);
    const dir  = a.above ? -1 : 1;
    const base = 10;
    const lh   = 12;
    const n    = a.lines.length;

    svg.append("line")
      .attr("x1", cx).attr("y1", cy + dir * 5)
      .attr("x2", cx).attr("y2", cy + dir * (base + 2))
      .attr("stroke", "#bbb").attr("stroke-width", 0.8);

    const startY = a.above
      ? cy - base - (n - 1) * lh
      : cy + base + lh;

    const t = svg.append("text")
      .attr("text-anchor", a.anchor)
      .attr("font-size", "0.6rem")
      .attr("fill", "#555");

    a.lines.forEach((line, i) => {
      t.append("tspan")
        .attr("x", cx)
        .attr("y", startY + i * lh)
        .text(line);
    });
  });

  // ── legend ──
  const lx = width - 210;
  const ly = -40;

  svg.append("line")
    .attr("x1", lx).attr("x2", lx + 22)
    .attr("y1", ly + 6).attr("y2", ly + 6)
    .attr("stroke", AMBER).attr("stroke-width", 2.5);
  svg.append("circle").attr("cx", lx + 11).attr("cy", ly + 6).attr("r", 3.5).attr("fill", AMBER);
  svg.append("text")
    .attr("x", lx + 28).attr("y", ly + 10)
    .attr("font-size", "0.68rem").attr("fill", "#555")
    .text("Pérdidas eléctricas (%)");

  svg.append("line")
    .attr("x1", lx).attr("x2", lx + 22)
    .attr("y1", ly + 22).attr("y2", ly + 22)
    .attr("stroke", RED_DARK).attr("stroke-width", 1.8)
    .attr("stroke-dasharray", "5 3");
  svg.append("text")
    .attr("x", lx + 28).attr("y", ly + 26)
    .attr("font-size", "0.68rem").attr("fill", "#555")
    .text("Subsidio gubernamental ($B)");
}

// ── Chart 2: Horizontal lollipop — LAC losses comparison ─────────────────────
export function drawChart2(container, data) {
  const reference = data.find(d => d.reference);
  const countries = data.filter(d => !d.reference)
    .sort((a, b) => b.losses_pct - a.losses_pct); // DR (29%) at top

  const margin = { top: 30, right: 60, bottom: 50, left: 172 };
  const width  = Math.min(container.clientWidth, 800) - margin.left - margin.right;
  const rowH   = 34;
  const height = countries.length * rowH;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 32]).range([0, width]);

  const y = d3.scaleBand()
    .domain(countries.map(d => d.country))
    .range([0, height])
    .padding(0.2);

  // ── OECD reference line ──
  if (reference) {
    svg.append("line")
      .attr("x1", x(reference.losses_pct)).attr("x2", x(reference.losses_pct))
      .attr("y1", -10).attr("y2", height)
      .attr("stroke", "#888").attr("stroke-width", 1)
      .attr("stroke-dasharray", "5 4");

    svg.append("text")
      .attr("x", x(reference.losses_pct))
      .attr("y", -14)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.62rem")
      .attr("fill", "#888")
      .text(`Promedio OCDE: ${reference.losses_pct}%`);
  }

  // ── lollipop stems (animated) ──
  svg.selectAll(".stem")
    .data(countries)
    .join("line")
    .attr("class", "stem")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", d => y(d.country) + y.bandwidth() / 2)
    .attr("y2", d => y(d.country) + y.bandwidth() / 2)
    .attr("stroke", d => d.highlight ? AMBER : "#ddd")
    .attr("stroke-width", d => d.highlight ? 2.5 : 1.5)
    .transition()
    .delay((d, i) => i * 40)
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr("x2", d => x(d.losses_pct));

  // ── lollipop heads ──
  svg.selectAll(".head")
    .data(countries)
    .join("circle")
    .attr("class", "head")
    .attr("cx", 0)
    .attr("cy", d => y(d.country) + y.bandwidth() / 2)
    .attr("r",  d => d.highlight ? 8 : 5)
    .attr("fill", d => d.highlight ? AMBER : "#ccc")
    .attr("stroke", d => d.highlight ? "#fff" : "none")
    .attr("stroke-width", 1.5)
    .transition()
    .delay((d, i) => i * 40)
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr("cx", d => x(d.losses_pct));

  // ── country labels ──
  svg.selectAll(".country-label")
    .data(countries)
    .join("text")
    .attr("class", "country-label")
    .attr("x", -10)
    .attr("y", d => y(d.country) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .attr("font-size", d => d.highlight ? "0.82rem" : "0.75rem")
    .attr("font-weight", d => d.highlight ? "700" : "400")
    .attr("fill", d => d.highlight ? AMBER : "#444")
    .text(d => d.highlight ? `Rep. Dominicana — ${d.losses_pct}%` : d.country);

  // ── value labels at head ──
  svg.selectAll(".value-label")
    .data(countries.filter(d => !d.highlight))
    .join("text")
    .attr("class", "value-label")
    .attr("x", d => x(d.losses_pct) + 10)
    .attr("y", d => y(d.country) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-size", "0.65rem")
    .attr("fill", "#888")
    .attr("opacity", 0)
    .text(d => `${d.losses_pct}%`)
    .transition().delay((d, i) => i * 40 + 700).duration(300)
    .attr("opacity", 1);

  // ── x axis ──
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`).tickSize(-height).tickPadding(8));

  removeDomain(svg);
  svg.selectAll(".axis .tick line").attr("stroke", "#ebebeb").attr("stroke-dasharray", "3 3");
}

// ── Chart 3: Grouped bar chart — electricity vs education vs health ───────────
export function drawChart3(container, data) {
  const margin = { top: 50, right: 30, bottom: 60, left: 55 };
  const width  = Math.min(container.clientWidth, 820) - margin.left - margin.right;
  const height = 380 - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const keys   = ["electricity_subsidy", "education", "health"];
  const colors = { electricity_subsidy: AMBER, education: BLUE, health: GREEN };
  const labels = {
    electricity_subsidy: "Subsidio eléctrico",
    education: "Educación",
    health: "Salud"
  };

  const xOuter = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.28);

  const xInner = d3.scaleBand()
    .domain(keys)
    .range([0, xOuter.bandwidth()])
    .padding(0.06);

  const y = d3.scaleLinear().domain([0, 5]).range([height, 0]);

  // gridlines via left axis
  svg.append("g").attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}B`).tickSize(-width).tickPadding(8));

  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xOuter).tickFormat(d3.format("d")).tickSize(0).tickPadding(10));

  removeDomain(svg);

  // ── bars ──
  data.forEach((yearData, gi) => {
    keys.forEach((key, ki) => {
      svg.append("rect")
        .attr("x", xOuter(yearData.year) + xInner(key))
        .attr("width", xInner.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .attr("fill", colors[key])
        .attr("rx", 2)
        .attr("opacity", 0.88)
        .transition()
        .delay(gi * 60 + ki * 80)
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr("y", y(yearData[key]))
        .attr("height", height - y(yearData[key]));
    });
  });

  // ── annotation at 2023 ──
  const last = data[data.length - 1];
  const annotX = xOuter(last.year) + xInner("electricity_subsidy") + xInner.bandwidth() / 2;
  const annotY = y(last.electricity_subsidy) - 12;

  svg.append("line")
    .attr("x1", xOuter(last.year) + xInner("electricity_subsidy"))
    .attr("x2", xOuter(last.year) + xInner("education") + xInner.bandwidth())
    .attr("y1", annotY + 6).attr("y2", annotY + 6)
    .attr("stroke", "#aaa").attr("stroke-width", 0.8)
    .attr("stroke-dasharray", "3 2");

  svg.append("text")
    .attr("x", xOuter(last.year) + xOuter.bandwidth() / 2)
    .attr("y", annotY - 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.6rem")
    .attr("fill", "#555")
    .text("El subsidio eléctrico equivale");

  svg.append("text")
    .attr("x", xOuter(last.year) + xOuter.bandwidth() / 2)
    .attr("y", annotY - 2 + 11)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.6rem")
    .attr("fill", "#555")
    .text("a casi la mitad de educación");

  // ── legend ──
  const legendY = height + 38;
  const totalLW = keys.length * 130;
  const startX  = (width - totalLW) / 2;

  keys.forEach((key, i) => {
    const lx = startX + i * 130;
    svg.append("rect")
      .attr("x", lx).attr("y", legendY)
      .attr("width", 12).attr("height", 12)
      .attr("fill", colors[key]).attr("rx", 2);
    svg.append("text")
      .attr("x", lx + 16).attr("y", legendY + 10)
      .attr("font-size", "0.7rem").attr("fill", "#555")
      .text(labels[key]);
  });
}

// ── Chart 4: Horizontal bar comparison — solar vs subsidies ──────────────────
export function drawChart4(container, data) {
  const margin = { top: 30, right: 110, bottom: 30, left: 220 };
  const width  = Math.min(container.clientWidth, 760) - margin.left - margin.right;
  const rowH   = 56;
  const height = data.length * rowH;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 7]).range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, height])
    .padding(0.28);

  // ── bars ──
  svg.selectAll(".hbar")
    .data(data)
    .join("rect")
    .attr("class", "hbar")
    .attr("x", 0)
    .attr("y", d => y(d.label))
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", d => d.color)
    .attr("rx", 3)
    .attr("opacity", 0.88)
    .transition()
    .delay((d, i) => i * 120)
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr("width", d => x(d.value));

  // ── labels on left ──
  svg.selectAll(".bar-label")
    .data(data)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", -10)
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .attr("font-size", "0.78rem")
    .attr("fill", "#333")
    .text(d => d.label);

  // ── value labels at bar end ──
  svg.selectAll(".val-label")
    .data(data)
    .join("text")
    .attr("class", "val-label")
    .attr("x", d => x(d.value) + 8)
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-size", "0.82rem")
    .attr("font-weight", "700")
    .attr("fill", d => d.color)
    .attr("opacity", 0)
    .text(d => `$${d.value}B`)
    .transition().delay((d, i) => i * 120 + 680).duration(300)
    .attr("opacity", 1);

  // ── annotation connecting bars 1 and 2 ──
  const bar1 = data[0];
  const bar2 = data[1];
  const y1c  = y(bar1.label) + y.bandwidth() / 2;
  const y2c  = y(bar2.label) + y.bandwidth() / 2;
  const axB1 = x(bar1.value) + 55;
  const axB2 = x(bar2.value) + 55;
  const braceX = Math.min(axB1, axB2) + 10;

  svg.append("line")
    .attr("x1", x(bar1.value) + 4).attr("x2", braceX)
    .attr("y1", y1c).attr("y2", y1c)
    .attr("stroke", "#aaa").attr("stroke-width", 0.9);
  svg.append("line")
    .attr("x1", x(bar2.value) + 4).attr("x2", braceX)
    .attr("y1", y2c).attr("y2", y2c)
    .attr("stroke", "#aaa").attr("stroke-width", 0.9);
  svg.append("line")
    .attr("x1", braceX).attr("x2", braceX)
    .attr("y1", y1c).attr("y2", y2c)
    .attr("stroke", "#aaa").attr("stroke-width", 0.9);

  const midY = (y1c + y2c) / 2;
  svg.append("text")
    .attr("x", braceX + 8).attr("y", midY - 7)
    .attr("font-size", "0.6rem").attr("fill", "#555")
    .text("La inversión solar cuesta");
  svg.append("text")
    .attr("x", braceX + 8).attr("y", midY + 6)
    .attr("font-size", "0.6rem").attr("fill", "#555")
    .text("menos que 3 años de subsidio");

  // ── text callout below SVG ──
  d3.select(container).append("div")
    .attr("class", "chart-callout")
    .text("Después del año 3: el gobierno ahorra $2B/año — para siempre.");
}
