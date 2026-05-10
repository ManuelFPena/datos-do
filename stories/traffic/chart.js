import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const ORANGE = "#e67e22";
const BLUE   = "#1a5276";
const GRAY   = "#95a5a6";

function animateLine(path, duration) {
  const len = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", len)
    .attr("stroke-dashoffset", len)
    .transition().duration(duration).ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);
}

function revealGroup(svg, group, fullWidth, fullHeight, duration) {
  const id = `clip-${Math.random().toString(36).slice(2, 8)}`;
  svg.append("defs").append("clipPath").attr("id", id)
    .append("rect")
      .attr("y", -10).attr("height", fullHeight + 20).attr("width", 0)
      .transition().duration(duration).ease(d3.easeLinear)
      .attr("width", fullWidth + 10);
  group.attr("clip-path", `url(#${id})`);
}

// ── Chart 1: Stacked area — fleet growth 2003–2023 ───────────────────────────

export function drawChart1(container, data) {
  const margin = { top: 40, right: 60, bottom: 50, left: 68 };
  const totalH = 360;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", totalH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain([new Date(2003, 0, 1), new Date(2023, 0, 1)])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, 7000000])
    .range([height, 0]);

  // Axes
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%Y")));

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(5)
      .tickFormat(d => (d / 1_000_000).toFixed(0) + "M")
      .tickSize(-width))
    .selectAll(".tick line").attr("stroke", "#eee");

  svg.selectAll(".domain").remove();

  // Stack: cars (bottom) → motorcycles (top)
  const stack  = d3.stack().keys(["cars", "motorcycles"]);
  const series = stack(data);

  const area = d3.area()
    .x(d  => x(new Date(d.data.year, 0, 1)))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveMonotoneX);

  const colors = { cars: GRAY, motorcycles: ORANGE };

  const areaGroup = svg.append("g");
  series.forEach(layer => {
    areaGroup.append("path")
      .datum(layer)
      .attr("fill", colors[layer.key])
      .attr("fill-opacity", 0.85)
      .attr("d", area);
  });

  revealGroup(svg, areaGroup, width, height, 900);

  // Annotation: 2015 — motos over 50%
  const x2015 = x(new Date(2015, 0, 1));
  const d2015 = data.find(d => d.year === 2015);
  if (d2015) {
    const yMid = y(d2015.cars + d2015.motorcycles / 2);
    svg.append("line")
      .attr("x1", x2015).attr("x2", x2015)
      .attr("y1", yMid - 10).attr("y2", yMid - 32)
      .attr("stroke", "#555").attr("stroke-width", 1);
    svg.append("text")
      .attr("x", x2015 + 6).attr("y", yMid - 36)
      .attr("font-size", "0.65rem").attr("fill", "#333")
      .text("Las motos superan el 50%");
  }

  // Annotation: 2022 — "3 de cada 5"
  const x2022 = x(new Date(2022, 0, 1));
  const d2022 = data.find(d => d.year === 2022);
  if (d2022) {
    const yTop = y(d2022.total);
    svg.append("text")
      .attr("x", x2022 - 6).attr("y", yTop - 10)
      .attr("text-anchor", "end")
      .attr("font-size", "0.65rem").attr("fill", "#333")
      .text("3 de cada 5 vehículos es una moto");
  }

  // Legend — bottom right
  const legendX = width - 150;
  const legendY = height - 10;
  [["Motocicletas", ORANGE], ["Automóviles", GRAY]].forEach(([label, color], i) => {
    svg.append("rect")
      .attr("x", legendX).attr("y", legendY - i * 18)
      .attr("width", 12).attr("height", 12).attr("rx", 1).attr("fill", color).attr("fill-opacity", 0.85);
    svg.append("text")
      .attr("x", legendX + 16).attr("y", legendY - i * 18 + 10)
      .attr("font-size", "0.68rem").attr("fill", "#555")
      .text(label);
  });

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", -54)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem").attr("fill", "#888")
    .text("Vehículos registrados");
}

// ── Chart 2: Lollipop — deaths per 100k ──────────────────────────────────────

export function drawChart2(container, data) {
  const countries = data.filter(d => !d.reference);
  const worldAvg  = data.find(d => d.reference);

  const margin = { top: 20, right: 120, bottom: 50, left: 158 };
  const totalH = 560;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", totalH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 70]).range([0, width]);

  const yBand = d3.scaleBand()
    .domain(countries.map(d => d.country))
    .range([0, height])
    .padding(0.4);

  // X axis
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(7).tickSize(-height))
    .selectAll(".tick line").attr("stroke", "#eee");

  // Y axis (country names)
  const yAxis = svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(yBand).tickSize(0));

  yAxis.selectAll("text")
    .attr("font-size", "0.72rem")
    .attr("font-weight", d => d === "República Dominicana" ? "700" : "400")
    .attr("fill",       d => d === "República Dominicana" ? ORANGE : "#555");

  svg.selectAll(".domain").remove();

  // World average reference line
  if (worldAvg) {
    svg.append("line")
      .attr("x1", x(worldAvg.value)).attr("x2", x(worldAvg.value))
      .attr("y1", 0).attr("y2", height)
      .attr("stroke", "#bbb").attr("stroke-width", 1.2).attr("stroke-dasharray", "5 3");
    svg.append("text")
      .attr("x", x(worldAvg.value) + 4).attr("y", -6)
      .attr("font-size", "0.63rem").attr("fill", "#bbb")
      .text(`Promedio mundial: ${worldAvg.value}`);
  }

  // Lollipop stems
  const stems = svg.selectAll(".stem")
    .data(countries)
    .join("line")
      .attr("class", "stem")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", d => yBand(d.country) + yBand.bandwidth() / 2)
      .attr("y2", d => yBand(d.country) + yBand.bandwidth() / 2)
      .attr("stroke", d => d.highlight ? ORANGE : "#ccc")
      .attr("stroke-width", d => d.highlight ? 2 : 1.2);

  stems.transition()
    .delay((d, i) => i * 50)
    .duration(500)
    .attr("x2", d => x(d.value));

  // Circles
  const circles = svg.selectAll(".dot")
    .data(countries)
    .join("circle")
      .attr("class", "dot")
      .attr("cx", x(0))
      .attr("cy", d => yBand(d.country) + yBand.bandwidth() / 2)
      .attr("r", d => d.highlight ? 8 : 5)
      .attr("fill", d => d.highlight ? ORANGE : "#ccc")
      .attr("stroke", "#fff").attr("stroke-width", 1.5);

  circles.transition()
    .delay((d, i) => i * 50 + 400)
    .duration(200)
    .attr("cx", d => x(d.value));

  // Value labels to the right of each circle
  countries.forEach((d, i) => {
    svg.append("text")
      .attr("x", x(d.value) + (d.highlight ? 12 : 8))
      .attr("y", yBand(d.country) + yBand.bandwidth() / 2 + 4)
      .attr("font-size", d.highlight ? "0.75rem" : "0.67rem")
      .attr("font-weight", d.highlight ? "700" : "400")
      .attr("fill", d.highlight ? ORANGE : "#888")
      .attr("opacity", 0)
      .text(d.value)
      .transition().delay(i * 50 + 550).duration(150)
      .attr("opacity", 1);
  });

  svg.append("text")
    .attr("x", width + 8).attr("y", yBand("República Dominicana") + yBand.bandwidth() / 2 + 4)
    .attr("font-size", "0.7rem").attr("font-weight", "700").attr("fill", ORANGE)
    .text("← más alta del mundo");

  // X-axis label
  svg.append("text")
    .attr("x", width / 2).attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem").attr("fill", "#888")
    .text("Muertes por cada 100,000 habitantes");
}

// ── Chart 3: Horizontal stacked proportional bars — fleet composition ─────────

export function drawChart3(container, data) {
  const margin = { top: 20, right: 30, bottom: 60, left: 130 };
  const totalH = 250;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", totalH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const keys   = ["motorcycles", "cars", "suv", "trucks", "other"];
  const labels = { motorcycles: "Motos", cars: "Autos", suv: "SUV", trucks: "Camiones", other: "Otros" };
  const colors = {
    motorcycles: ORANGE,
    cars:        "#95a5a6",
    suv:         "#bdc3c7",
    trucks:      "#7f8c8d",
    other:       "#dfe6e9",
  };

  const yBand = d3.scaleBand()
    .domain(data.map(d => d.iso))
    .range([0, height])
    .padding(0.3);

  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);

  // Y axis (country names)
  const yAxis = svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(yBand).tickSize(0)
      .tickFormat(iso => data.find(d => d.iso === iso)?.country ?? iso));

  yAxis.selectAll("text")
    .attr("font-size", "0.72rem")
    .attr("font-weight", d => d === "DO" ? "700" : "400")
    .attr("fill",       d => d === "DO" ? ORANGE : "#555");

  svg.selectAll(".domain").remove();

  // Bars
  const barGroup = svg.append("g");

  data.forEach(country => {
    const bH = country.highlight ? 26 : 20;
    const bY = yBand(country.iso) + (yBand.bandwidth() - bH) / 2;
    let cumX = 0;

    keys.forEach(key => {
      const segW = x(cumX + country[key]) - x(cumX);

      barGroup.append("rect")
        .attr("x", x(cumX)).attr("y", bY)
        .attr("width", 0).attr("height", bH)
        .attr("fill", colors[key])
        .attr("rx", key === keys[0] ? 2 : 0)
        .transition().delay(50).duration(700).ease(d3.easeQuadOut)
        .attr("width", segW);

      // Label inside segment if segment > 8%
      if (country[key] > 8) {
        barGroup.append("text")
          .attr("x", x(cumX) + segW / 2)
          .attr("y", bY + bH / 2 + 4)
          .attr("text-anchor", "middle")
          .attr("font-size", "0.62rem")
          .attr("fill", key === "motorcycles" ? "#fff" : "#333")
          .attr("pointer-events", "none")
          .attr("opacity", 0)
          .text(`${country[key]}%`)
          .transition().delay(700).duration(200)
          .attr("opacity", 1);
      }

      cumX += country[key];
    });
  });

  // Legend
  const legW   = 75;
  const legXs  = keys.map((k, i) => i * legW);
  const legY   = height + 30;

  keys.forEach((key, i) => {
    svg.append("rect")
      .attr("x", legXs[i]).attr("y", legY)
      .attr("width", 10).attr("height", 10).attr("rx", 1)
      .attr("fill", colors[key]);
    svg.append("text")
      .attr("x", legXs[i] + 13).attr("y", legY + 9)
      .attr("font-size", "0.65rem").attr("fill", "#666")
      .text(labels[key]);
  });
}

// ── Chart 4: Dual-axis — fleet growth vs infrastructure investment ─────────────

export function drawChart4(container, data) {
  const margin = { top: 50, right: 72, bottom: 50, left: 62 };
  const totalH = 320;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalH - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", totalH)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([2012, 2022])
    .range([0, width]);

  const yVeh = d3.scaleLinear()
    .domain([2, 7])
    .range([height, 0]);

  const yInf = d3.scaleLinear()
    .domain([0, 2])
    .range([height, 0]);

  // Left Y axis (vehicles)
  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(yVeh).ticks(5).tickFormat(d => d + "M").tickSize(-width))
    .selectAll(".tick line").attr("stroke", "#eee");

  // Right Y axis (infrastructure %)
  svg.append("g")
    .attr("transform", `translate(${width},0)`)
    .call(d3.axisRight(yInf).ticks(5).tickFormat(d => d + "%"));

  // X axis
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(6));

  svg.selectAll(".domain").remove();

  const lineVeh = d3.line()
    .x(d => x(d.year)).y(d => yVeh(d.vehicles_millions)).curve(d3.curveMonotoneX);
  const lineInf = d3.line()
    .x(d => x(d.year)).y(d => yInf(d.infra_pct_gdp)).curve(d3.curveMonotoneX);

  // Vehicles line (orange, going up)
  const vehPath = svg.append("path")
    .datum(data).attr("fill", "none")
    .attr("stroke", ORANGE).attr("stroke-width", 2.5)
    .attr("d", lineVeh);
  animateLine(vehPath, 800);

  // Infrastructure line (blue, going down)
  const infPath = svg.append("path")
    .datum(data).attr("fill", "none")
    .attr("stroke", BLUE).attr("stroke-width", 2.5)
    .attr("d", lineInf);
  animateLine(infPath, 800);

  // Dots
  [{ vals: data, line: "veh", yFn: d => yVeh(d.vehicles_millions), color: ORANGE },
   { vals: data, line: "inf", yFn: d => yInf(d.infra_pct_gdp),    color: BLUE  }]
  .forEach(({ vals, yFn, color }) => {
    svg.selectAll(null).data(vals).join("circle")
      .attr("cx", d => x(d.year)).attr("cy", yFn)
      .attr("r", 4).attr("fill", color).attr("stroke", "#fff").attr("stroke-width", 1.5)
      .attr("opacity", 0)
      .transition().delay(700).duration(200).attr("opacity", 1);
  });

  // Annotation "Más vehículos, menos inversión" — midpoint 2017
  svg.append("text")
    .attr("x", x(2017)).attr("y", (yVeh(4.1) + yInf(1.2)) / 2 - 18)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem").attr("fill", "#333").attr("font-style", "italic")
    .text("Más vehículos, menos inversión");

  svg.append("text")
    .attr("x", x(2016)).attr("y", (yVeh(4.1) + yInf(1.2)) / 2 - 4)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.62rem").attr("fill", "#999")
    .text("Las líneas se separan año tras año →");

  // Legend
  [["Vehículos (millones)", ORANGE], ["Inversión vial (% PIB)", BLUE]].forEach(([label, color], i) => {
    const ly = -38 + i * 18;
    svg.append("line")
      .attr("x1", 0).attr("x2", 18).attr("y1", ly).attr("y2", ly)
      .attr("stroke", color).attr("stroke-width", 2.5);
    svg.append("text")
      .attr("x", 23).attr("y", ly + 4)
      .attr("font-size", "0.65rem").attr("fill", "#666")
      .text(label);
  });

  // Axis labels
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", -50)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem").attr("fill", ORANGE)
    .text("Vehículos (millones)");

  svg.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", height / 2).attr("y", -(width + 62))
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem").attr("fill", BLUE)
    .text("Inversión vial (% PIB)");
}
