import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Animate a solid path drawing left-to-right using the dashoffset trick
function animateLine(path, duration) {
  const len = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", len)
    .attr("stroke-dashoffset", len)
    .transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
}

// Animate a dashed path by expanding a clipPath rect left-to-right
function animateDashedLine(svg, path, duration) {
  const id = `clip-${Math.random().toString(36).slice(2, 8)}`;
  const bbox = path.node().getBBox();
  const clipRect = svg.append("clipPath")
    .attr("id", id)
    .append("rect")
      .attr("x", bbox.x - 2)
      .attr("y", bbox.y - 10)
      .attr("height", bbox.height + 20)
      .attr("width", 0);

  clipRect.transition().duration(duration).ease(d3.easeLinear)
    .attr("width", bbox.width + 4);

  path.attr("clip-path", `url(#${id})`);
}

// ── Chart 1: DR account ownership timeseries ──────────────────────────────────

export function drawChart1(container, data) {
  const margin = { top: 52, right: 60, bottom: 40, left: 55 };
  const totalH = 300;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;
  const RED    = "#c0392b";

  const x = d3.scalePoint()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.5);

  const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  const svg = d3.select(container)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", totalH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%").tickSize(-width))
    .selectAll(".tick line").attr("stroke", "#eee");

  svg.selectAll(".domain").remove();

  // Shaded decline region 2017→2021
  const d2017 = data.find(d => d.year === 2017);
  const d2021 = data.find(d => d.year === 2021);

  if (d2017 && d2021) {
    svg.append("rect")
      .attr("x", x(2017)).attr("y", 0)
      .attr("width", x(2021) - x(2017))
      .attr("height", height)
      .attr("fill", "rgba(192,57,43,0.07)");
  }

  // Line
  const path = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", RED)
    .attr("stroke-width", 2.5)
    .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.value)).curve(d3.curveMonotoneX));

  animateLine(path, 800);

  // Dots
  svg.selectAll(".dot")
    .data(data)
    .join("circle")
      .attr("cx", d => x(d.year)).attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", RED).attr("stroke", "#fff").attr("stroke-width", 2);

  // Annotation: 2017 peak (above)
  if (d2017) {
    const cx = x(2017), cy = y(d2017.value);
    svg.append("line")
      .attr("x1", cx).attr("y1", cy - 7)
      .attr("x2", cx).attr("y2", cy - 22)
      .attr("stroke", "#555").attr("stroke-width", 1);
    svg.append("text")
      .attr("x", cx).attr("y", cy - 27)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.67rem").attr("fill", "#333")
      .text(`Máximo histórico — ${d2017.value}%`);
  }

  // Annotation: 2021 drop (below)
  if (d2021) {
    const cx = x(2021), cy = y(d2021.value);
    svg.append("line")
      .attr("x1", cx).attr("y1", cy + 7)
      .attr("x2", cx).attr("y2", cy + 22)
      .attr("stroke", "#555").attr("stroke-width", 1);
    svg.append("text")
      .attr("x", cx).attr("y", cy + 34)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.67rem").attr("fill", RED)
      .text(`Caída a ${d2021.value}%`);
  }
}

// ── Chart 2: LAC slope chart 2017 → 2021 ─────────────────────────────────────

export function drawChart2(container, data) {
  const margin = { top: 40, right: 150, bottom: 50, left: 55 };
  const totalH = 460;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;

  const DR_COLOR  = "#c0392b";
  const GRAY      = "#ccc";
  const POS_COLOR = "#27ae60";
  const NEG_COLOR = "#c0392b";

  const years   = [2017, 2021];
  const lineGen = d3.line().x(d => x(d.year)).y(d => y(d.value));

  const x = d3.scalePoint().domain(years).range([0, width]).padding(0.5);
  const y = d3.scaleLinear().domain([20, 100]).range([height, 0]);

  const svg = d3.select(container)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", totalH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => d + "%").tickSize(-width))
    .selectAll(".tick line").attr("stroke", "#eee");

  svg.selectAll(".domain").remove();

  // LAC average reference
  const lacAvgPts = [{year: 2017, value: 55}, {year: 2021, value: 63}];
  svg.append("path")
    .datum(lacAvgPts).attr("fill", "none")
    .attr("stroke", "#bbb").attr("stroke-width", 1.2).attr("stroke-dasharray", "5 3")
    .attr("d", lineGen);
  svg.append("text")
    .attr("x", x(2021) + 8).attr("y", y(63) + 4)
    .attr("font-size", "0.65rem").attr("fill", "#bbb")
    .text("Prom. LAC");

  // Interactive country groups
  const CARD_W = 168, CARD_H = 62;
  const midX   = (x(2017) + x(2021)) / 2;
  const selectedISOs  = new Set();
  const countryGroups = {};

  data.filter(c => !c.highlight).forEach(c => {
    const pts = [{year: 2017, value: c.v2017}, {year: 2021, value: c.v2021}];
    const changeColor = c.change > 0 ? POS_COLOR : c.change < 0 ? NEG_COLOR : "#888";

    const g = svg.append("g").attr("opacity", 0.25).style("cursor", "pointer");

    g.append("path")
      .datum(pts).attr("fill", "none").attr("stroke", "transparent").attr("stroke-width", 14)
      .attr("d", lineGen);

    const visPath = g.append("path")
      .datum(pts).attr("fill", "none").attr("stroke", GRAY).attr("stroke-width", 1)
      .attr("d", lineGen);
    animateLine(visPath, 700);

    g.append("circle")
      .attr("cx", x(2021)).attr("cy", y(c.v2021)).attr("r", 3).attr("fill", GRAY);

    // Info card
    const cardMidY = (y(c.v2017) + y(c.v2021)) / 2;
    const cardX    = (midX + 10 + CARD_W <= width) ? midX + 10 : midX - CARD_W - 10;
    const cardY    = Math.max(0, Math.min(cardMidY - CARD_H / 2, height - CARD_H));

    const card = g.append("g")
      .attr("class", "country-card")
      .attr("transform", `translate(${cardX},${cardY})`)
      .style("display", "none")
      .on("click", e => e.stopPropagation());

    card.append("rect")
      .attr("width", CARD_W).attr("height", CARD_H).attr("rx", 3)
      .attr("fill", "#fff").attr("stroke", "#ddd").attr("stroke-width", 1)
      .style("filter", "drop-shadow(0 1px 4px rgba(0,0,0,0.10))");
    card.append("text").attr("x", 9).attr("y", 18)
      .attr("font-size", "0.75rem").attr("font-weight", "700").attr("fill", "#1a1a1a")
      .text(c.country_es);
    card.append("text").attr("x", 9).attr("y", 36)
      .attr("font-size", "0.68rem").attr("fill", "#666")
      .text(`2017: ${c.v2017}%  →  2021: ${c.v2021}%`);
    card.append("text").attr("x", 9).attr("y", 52)
      .attr("font-size", "0.7rem").attr("fill", changeColor)
      .text(c.change > 0 ? `+${c.change.toFixed(1)} pts` : `${c.change.toFixed(1)} pts`);

    g.on("click", function(event) {
      event.stopPropagation();
      if (selectedISOs.has(c.iso)) {
        selectedISOs.delete(c.iso);
      } else {
        if (selectedISOs.size >= 2) return;
        selectedISOs.add(c.iso);
      }
      updateSelection();
    });

    countryGroups[c.iso] = g;
  });

  function updateSelection() {
    Object.entries(countryGroups).forEach(([iso, g]) => {
      const sel = selectedISOs.has(iso);
      g.attr("opacity", sel ? 1 : 0.25);
      g.select(".country-card").style("display", sel ? null : "none");
    });
  }

  // DR — always on top, never interactive
  const dr = data.find(c => c.iso === "DO");
  if (dr) {
    const drPts = [{year: 2017, value: dr.v2017}, {year: 2021, value: dr.v2021}];

    const drPath = svg.append("path")
      .datum(drPts).attr("fill", "none")
      .attr("stroke", DR_COLOR).attr("stroke-width", 3)
      .style("pointer-events", "none")
      .attr("d", lineGen);
    animateLine(drPath, 700);

    drPts.forEach(pt =>
      svg.append("circle")
        .attr("cx", x(pt.year)).attr("cy", y(pt.value)).attr("r", 5)
        .attr("fill", DR_COLOR).attr("stroke", "#fff").attr("stroke-width", 2)
        .style("pointer-events", "none")
    );

    // Left label
    svg.append("text")
      .attr("x", x(2017) - 10).attr("y", y(dr.v2017) + 4)
      .attr("text-anchor", "end")
      .attr("font-size", "0.72rem").attr("font-weight", "700").attr("fill", DR_COLOR)
      .style("pointer-events", "none")
      .text("R. Dominicana");

    // Right label
    svg.append("text")
      .attr("x", x(2021) + 10).attr("y", y(dr.v2021) + 4)
      .attr("font-size", "0.72rem").attr("font-weight", "700").attr("fill", DR_COLOR)
      .style("pointer-events", "none")
      .text("R. Dominicana");

    // Change annotation at midpoint
    svg.append("text")
      .attr("x", midX + 8)
      .attr("y", (y(dr.v2017) + y(dr.v2021)) / 2 - 7)
      .attr("font-size", "0.7rem").attr("font-weight", "600").attr("fill", DR_COLOR)
      .style("pointer-events", "none")
      .text(`${dr.change.toFixed(1)} pts`);
  }

  svg.append("text")
    .attr("x", width / 2).attr("y", -22)
    .attr("text-anchor", "middle").attr("font-size", "0.8rem").attr("fill", "#555")
    .text("Tenencia de cuentas bancarias 2017 → 2021 (% adultos)");
}

// ── Chart 3: Horizontal bar chart — breakdown by group ────────────────────────

export function drawChart3(container, data) {
  const margin = { top: 22, right: 90, bottom: 50, left: 130 };
  const totalH = 250;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;

  const BLUE    = "#1a5276";
  const RED     = "#c0392b";
  const NAT_AVG = 51.3;

  const svg = d3.select(container)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", totalH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const yBand = d3.scaleBand()
    .domain(data.map(d => d.group))
    .range([0, height])
    .padding(0.35);

  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%").tickSize(-height))
    .selectAll(".tick line").attr("stroke", "#eee");

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(yBand).tickSize(0))
    .select(".domain").remove();

  svg.selectAll(".domain").remove();

  // Bars
  const bars = svg.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yBand(d.group))
      .attr("height", yBand.bandwidth())
      .attr("fill", d => d.category === "gender" ? BLUE : RED)
      .attr("rx", 2)
      .attr("width", 0);

  bars.transition()
    .delay((d, i) => i * 130)
    .duration(600)
    .ease(d3.easeQuadOut)
    .attr("width", d => x(d.value));

  // Value labels — appear after bars animate
  data.forEach((d, i) => {
    svg.append("text")
      .attr("x", x(d.value) + 7)
      .attr("y", yBand(d.group) + yBand.bandwidth() / 2 + 4)
      .attr("font-size", "0.75rem").attr("fill", "#555")
      .attr("opacity", 0)
      .transition().delay(i * 130 + 500).duration(150)
      .attr("opacity", 1)
      .tween("text", function() {
        return () => {};
      });
    svg.append("text")
      .attr("x", x(d.value) + 7)
      .attr("y", yBand(d.group) + yBand.bandwidth() / 2 + 4)
      .attr("font-size", "0.75rem").attr("fill", "#555")
      .attr("opacity", 0)
      .transition().delay(i * 130 + 550).duration(100)
      .attr("opacity", 1);
  });

  // Simplified label approach — static (appear after all bars)
  svg.selectAll(".bar-label")
    .data(data)
    .join("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.value) + 7)
      .attr("y", d => yBand(d.group) + yBand.bandwidth() / 2 + 4)
      .attr("font-size", "0.75rem").attr("fill", "#555")
      .attr("opacity", 0)
      .text(d => `${d.value}%`)
      .transition().delay((d, i) => i * 130 + 500).duration(200)
      .attr("opacity", 1);

  // National average reference line
  svg.append("line")
    .attr("x1", x(NAT_AVG)).attr("x2", x(NAT_AVG))
    .attr("y1", -10).attr("y2", height + 8)
    .attr("stroke", "#aaa").attr("stroke-width", 1.2).attr("stroke-dasharray", "4 3");

  svg.append("text")
    .attr("x", x(NAT_AVG)).attr("y", -14)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.65rem").attr("fill", "#999")
    .text(`Promedio nacional: ${NAT_AVG}%`);

  // Category legend
  [["Género", BLUE], ["Ingresos", RED]].forEach(([label, color], i) => {
    svg.append("rect")
      .attr("x", width - 75).attr("y", i * 17)
      .attr("width", 10).attr("height", 10).attr("rx", 1).attr("fill", color);
    svg.append("text")
      .attr("x", width - 61).attr("y", i * 17 + 9)
      .attr("font-size", "0.65rem").attr("fill", "#666")
      .text(label);
  });
}

// ── Chart 4: Dual-axis — remittances vs account ownership ─────────────────────

export function drawChart4(container, data) {
  const margin = { top: 52, right: 72, bottom: 50, left: 62 };
  const totalH = 340;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;

  const BLUE = "#1a5276";
  const RED  = "#c0392b";

  const remit     = data.remittances;
  const ownership = data.dr_timeseries;

  const yearMin = d3.min(remit, d => d.year);
  const yearMax = d3.max(remit, d => d.year);

  const x = d3.scaleLinear().domain([yearMin, yearMax]).range([0, width]);

  const yRemit = d3.scaleLinear()
    .domain([0, d3.max(remit, d => d.value) * 1.18])
    .range([height, 0]).nice();

  const yOwn = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  const svg = d3.select(container)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", totalH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Left Y axis (remittances)
  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(yRemit).ticks(5).tickFormat(d => `$${d}B`).tickSize(-width))
    .selectAll(".tick line").attr("stroke", "#eee");

  // Right Y axis (ownership %) — ticks only, no grid
  svg.append("g")
    .attr("class", "axis axis--y-right")
    .attr("transform", `translate(${width},0)`)
    .call(d3.axisRight(yOwn).ticks(5).tickFormat(d => d + "%"));

  // X axis
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(8));

  svg.selectAll(".domain").remove();

  // 2021 vertical marker
  svg.append("line")
    .attr("x1", x(2021)).attr("x2", x(2021))
    .attr("y1", 0).attr("y2", height)
    .attr("stroke", "#e8e8e8").attr("stroke-width", 1);

  // Remittances line (solid blue)
  const remitPath = svg.append("path")
    .datum(remit).attr("fill", "none")
    .attr("stroke", BLUE).attr("stroke-width", 2.5)
    .attr("d", d3.line().x(d => x(d.year)).y(d => yRemit(d.value)).curve(d3.curveMonotoneX));
  animateLine(remitPath, 900);

  // Account ownership dashed connecting line (4 points only)
  const ownPath = svg.append("path")
    .datum(ownership).attr("fill", "none")
    .attr("stroke", RED).attr("stroke-width", 2)
    .attr("stroke-dasharray", "6 3")
    .attr("d", d3.line().x(d => x(d.year)).y(d => yOwn(d.value)));
  animateDashedLine(svg, ownPath, 900);

  // Ownership dots — fade in at end of animation
  svg.selectAll(".own-dot")
    .data(ownership)
    .join("circle")
      .attr("class", "own-dot")
      .attr("cx", d => x(d.year)).attr("cy", d => yOwn(d.value))
      .attr("r", 5)
      .attr("fill", RED).attr("stroke", "#fff").attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition().delay(750).duration(200)
      .attr("opacity", 1);

  // 2021 annotation (above chart area)
  const remit2021 = remit.find(d => d.year === 2021);
  const own2021   = ownership.find(d => d.year === 2021);
  if (remit2021 && own2021) {
    svg.append("text")
      .attr("x", x(2021)).attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.64rem").attr("fill", "#555")
      .text(`Remesas: $${remit2021.value}B · Cuentas: ${own2021.value}%`);
  }

  // Axis labels
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem").attr("fill", BLUE)
    .text("Remesas recibidas (miles de millones USD)");

  svg.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", height / 2).attr("y", -(width + 62))
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem").attr("fill", RED)
    .text("% adultos con cuenta");

  // Legend
  const legendItems = [
    { label: "Remesas recibidas (miles de millones USD)", color: BLUE, dash: false },
    { label: "Cuentas bancarias (% adultos)",             color: RED,  dash: true  },
  ];
  legendItems.forEach((item, i) => {
    const ly = -40 + i * 18;
    svg.append("line")
      .attr("x1", 0).attr("x2", 18).attr("y1", ly).attr("y2", ly)
      .attr("stroke", item.color).attr("stroke-width", item.dash ? 2 : 2.5)
      .attr("stroke-dasharray", item.dash ? "5 3" : null);
    svg.append("text")
      .attr("x", 23).attr("y", ly + 4)
      .attr("font-size", "0.65rem").attr("fill", "#666")
      .text(item.label);
  });
}
