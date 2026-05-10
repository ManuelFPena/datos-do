import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawChart(container, data) {
  const margin = { top: 40, right: 120, bottom: 50, left: 50 };
  const totalHeight = 480;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const DR_COLOR   = "#2c4f8c";
  const GRAY       = "#c8c8c8";
  const OECD_COLOR = "#aaaaaa";
  const POS_COLOR  = "#27ae60";
  const NEG_COLOR  = "#c0392b";

  const countries  = data.countries;
  const oecdRef    = data.oecd_reference;
  const subject    = "reading";

  const flat = [];
  countries.forEach(c => {
    c.scores.forEach(s => {
      flat.push({ iso: c.iso, year: s.year, score: s[subject], highlight: c.highlight, name: c.country_es });
    });
  });

  const years = [2018, 2022];
  const countriesWithBoth = countries.filter(c =>
    c.scores.some(s => s.year === 2018) && c.scores.some(s => s.year === 2022)
  );

  const x = d3.scalePoint()
    .domain(years)
    .range([0, width])
    .padding(0.5);

  const allScores = flat.map(d => d.score)
    .concat(oecdRef.map(d => d[subject]));
  const y = d3.scaleLinear()
    .domain([d3.min(allScores) - 10, d3.max(allScores) + 20])
    .range([height, 0])
    .nice();

  const svg = d3.select(container)
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", totalHeight)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Axes
  const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(y).ticks(6).tickSize(-width);

  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis)
    .selectAll(".tick line").attr("stroke", "#eee");

  svg.selectAll(".domain").remove();

  // OECD reference slope
  const oecdLine = d3.line()
    .x(d => x(d.year))
    .y(d => y(d[subject]));

  svg.append("path")
    .datum(oecdRef)
    .attr("fill", "none")
    .attr("stroke", OECD_COLOR)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "5 3")
    .attr("d", oecdLine);

  svg.append("text")
    .attr("x", x(2022) + 6)
    .attr("y", y(oecdRef.find(d => d.year === 2022)[subject]) + 4)
    .attr("font-size", "0.65rem")
    .attr("fill", OECD_COLOR)
    .text("OCDE");

  // ── Country groups (interactive) ──────────────────────────────────────────

  const CARD_W = 162;
  const CARD_H = 60;
  const midX   = (x(2018) + x(2022)) / 2;

  const selectedISOs   = new Set();
  const countryGroups  = {};

  countriesWithBoth.filter(c => !c.highlight).forEach(c => {
    const pts = years.map(yr => {
      const s = c.scores.find(d => d.year === yr);
      return s ? { year: yr, score: s[subject] } : null;
    }).filter(Boolean);

    const score2018  = pts.find(d => d.year === 2018)?.score;
    const score2022  = pts.find(d => d.year === 2022)?.score;
    const change     = c.change_2018_2022?.[subject];
    const changeColor = change > 0 ? POS_COLOR : change < 0 ? NEG_COLOR : "#888";

    const g = svg.append("g")
      .attr("opacity", 0.15)
      .style("cursor", "pointer");

    // Wide invisible hit area for easier clicking
    g.append("path")
      .datum(pts)
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 14)
      .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.score)));

    // Visible line
    g.append("path")
      .datum(pts)
      .attr("fill", "none")
      .attr("stroke", GRAY)
      .attr("stroke-width", 1.5)
      .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.score)));

    // Endpoint dot at 2022
    if (score2022 != null) {
      g.append("circle")
        .attr("cx", x(2022)).attr("cy", y(score2022))
        .attr("r", 3).attr("fill", GRAY);
    }

    // Info card — positioned at line midpoint, hidden until selected
    const cardMidY = (score2018 != null && score2022 != null)
      ? (y(score2018) + y(score2022)) / 2
      : y(score2022 ?? score2018);
    const cardX = (midX + 10 + CARD_W <= width) ? midX + 10 : midX - CARD_W - 10;
    const cardY = Math.max(0, Math.min(cardMidY - CARD_H / 2, height - CARD_H));

    const card = g.append("g")
      .attr("class", "country-card")
      .attr("transform", `translate(${cardX},${cardY})`)
      .style("display", "none")
      .on("click", event => event.stopPropagation());

    card.append("rect")
      .attr("width", CARD_W).attr("height", CARD_H)
      .attr("rx", 3)
      .attr("fill", "#fff").attr("stroke", "#ddd").attr("stroke-width", 1)
      .style("filter", "drop-shadow(0 1px 4px rgba(0,0,0,0.10))");

    card.append("text")
      .attr("x", 9).attr("y", 18)
      .attr("font-size", "0.75rem").attr("font-weight", "700").attr("fill", "#1a1a1a")
      .text(c.country_es);

    card.append("text")
      .attr("x", 9).attr("y", 35)
      .attr("font-size", "0.68rem").attr("fill", "#666")
      .text(score2018 != null
        ? `2018: ${score2018}  →  2022: ${score2022}`
        : `2022: ${score2022}`);

    if (change != null) {
      card.append("text")
        .attr("x", 9).attr("y", 51)
        .attr("font-size", "0.7rem").attr("fill", changeColor)
        .text(change > 0 ? `+${change} pts` : `${change} pts`);
    }

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
      g.attr("opacity", sel ? 1 : 0.15);
      g.select(".country-card").style("display", sel ? null : "none");
    });
  }

  // ── DR slope — drawn last, always on top, never interactive ───────────────

  const dr = countries.find(c => c.iso === "DO");
  if (dr) {
    const drPts = years.map(yr => {
      const s = dr.scores.find(d => d.year === yr);
      return s ? { year: yr, score: s[subject] } : null;
    }).filter(Boolean);

    svg.append("path")
      .datum(drPts)
      .attr("fill", "none")
      .attr("stroke", DR_COLOR)
      .attr("stroke-width", 3)
      .style("pointer-events", "none")
      .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.score)));

    drPts.forEach(pt => {
      svg.append("circle")
        .attr("cx", x(pt.year)).attr("cy", y(pt.score))
        .attr("r", 5)
        .attr("fill", DR_COLOR).attr("stroke", "#fff").attr("stroke-width", 2)
        .style("pointer-events", "none");
    });

    const start2018 = drPts.find(d => d.year === 2018);
    if (start2018) {
      svg.append("text")
        .attr("x", x(2018) - 8).attr("y", y(start2018.score) + 4)
        .attr("text-anchor", "end")
        .attr("font-size", "0.75rem").attr("font-weight", "700").attr("fill", DR_COLOR)
        .style("pointer-events", "none")
        .text("R. Dominicana");
    }

    const end2022 = drPts.find(d => d.year === 2022);
    if (end2022 && dr.change_2018_2022) {
      const change = dr.change_2018_2022[subject];
      svg.append("text")
        .attr("x", x(2022) + 10).attr("y", y(end2022.score) + 4)
        .attr("font-size", "0.7rem").attr("fill", DR_COLOR)
        .style("pointer-events", "none")
        .text(`+${change} pts`);
    }
  }

  // Subject label
  svg.append("text")
    .attr("x", width / 2).attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.8rem").attr("fill", "#555")
    .text("Puntaje PISA — Lectura (2018 → 2022)");

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", -38)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.7rem").attr("fill", "#888")
    .text("Puntaje promedio");
}
