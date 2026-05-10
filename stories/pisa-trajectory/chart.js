import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawChart(container, data) {
  const margin = { top: 40, right: 120, bottom: 50, left: 50 };
  const totalHeight = 480;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const DR_COLOR   = "#2c4f8c";
  const GRAY       = "#c8c8c8";
  const OECD_COLOR = "#aaaaaa";

  const countries   = data.countries;
  const oecdRef     = data.oecd_reference;
  const subject     = "reading"; // default subject shown

  // Build a flat array of {iso, year, score, highlight, name}
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

  // Grey country slopes
  countriesWithBoth.filter(c => !c.highlight).forEach(c => {
    const pts = years.map(yr => {
      const s = c.scores.find(d => d.year === yr);
      return s ? { year: yr, score: s[subject] } : null;
    }).filter(Boolean);

    svg.append("path")
      .datum(pts)
      .attr("fill", "none")
      .attr("stroke", GRAY)
      .attr("stroke-width", 1.5)
      .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.score)));

    // Dot at 2022
    const end = pts.find(d => d.year === 2022);
    if (end) {
      svg.append("circle")
        .attr("cx", x(2022))
        .attr("cy", y(end.score))
        .attr("r", 3)
        .attr("fill", GRAY);
    }
  });

  // DR slope — drawn last (on top)
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
      .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.score)));

    drPts.forEach(pt => {
      svg.append("circle")
        .attr("cx", x(pt.year))
        .attr("cy", y(pt.score))
        .attr("r", 5)
        .attr("fill", DR_COLOR)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
    });

    // Label at start
    const start2018 = drPts.find(d => d.year === 2018);
    if (start2018) {
      svg.append("text")
        .attr("x", x(2018) - 8)
        .attr("y", y(start2018.score) + 4)
        .attr("text-anchor", "end")
        .attr("font-size", "0.75rem")
        .attr("font-weight", "700")
        .attr("fill", DR_COLOR)
        .text("R. Dominicana");
    }

    // Change annotation at 2022
    const end2022 = drPts.find(d => d.year === 2022);
    if (end2022 && dr.change_2018_2022) {
      const change = dr.change_2018_2022[subject];
      svg.append("text")
        .attr("x", x(2022) + 10)
        .attr("y", y(end2022.score) + 4)
        .attr("font-size", "0.7rem")
        .attr("fill", DR_COLOR)
        .text(`+${change} pts`);
    }
  }

  // Subject label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.8rem")
    .attr("fill", "#555")
    .text("Puntaje PISA — Lectura (2018 → 2022)");

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -38)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.7rem")
    .attr("fill", "#888")
    .text("Puntaje promedio");
}
