import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PURPLE = "#8e44ad";
const PURPLE_LIGHT = "#c39bd3";
const GREY = "#bdc3c7";
const GREY_DARK = "#7f8c8d";

// ── Chart 1: Gini trend with LAC and OECD reference lines ────────────────────
export function drawChart1(container, data) {
  const { gini_trend, lac_gini_ref, oecd_gini_ref } = data;

  const margin = { top: 40, right: 80, bottom: 40, left: 50 };
  const width  = container.clientWidth - margin.left - margin.right;
  const height = 380 - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const allYears = gini_trend.map(d => d.year);
  const x = d3.scaleLinear()
    .domain(d3.extent(allYears))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([28, 58])
    .range([height, 0]);

  // Shaded improvement region
  const area = d3.area()
    .x(d => x(d.year))
    .y0(height)
    .y1(d => y(d.value))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(gini_trend)
    .attr("fill", PURPLE)
    .attr("opacity", 0.08)
    .attr("d", area);

  // Reference line: LAC average
  const lacLine = d3.line().x(d => x(d.year)).y(d => y(d.value)).curve(d3.curveMonotoneX);
  svg.append("path")
    .datum(lac_gini_ref)
    .attr("fill", "none")
    .attr("stroke", GREY_DARK)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "6 4")
    .attr("opacity", 0.6)
    .attr("d", lacLine);

  // Reference line: OECD average
  svg.append("path")
    .datum(oecd_gini_ref)
    .attr("fill", "none")
    .attr("stroke", GREY_DARK)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3 3")
    .attr("opacity", 0.45)
    .attr("d", lacLine);

  // DR main line
  const drLine = d3.line().x(d => x(d.year)).y(d => y(d.value)).curve(d3.curveMonotoneX);
  const drPath = svg.append("path")
    .datum(gini_trend)
    .attr("fill", "none")
    .attr("stroke", PURPLE)
    .attr("stroke-width", 2.5)
    .attr("d", drLine);

  const totalLength = drPath.node().getTotalLength();
  drPath
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength)
    .transition().duration(1400).ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0);

  // End dot
  const last = gini_trend[gini_trend.length - 1];
  svg.append("circle")
    .attr("cx", x(last.year))
    .attr("cy", y(last.value))
    .attr("r", 4.5)
    .attr("fill", PURPLE);

  // Axes
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(7).tickSize(0).tickPadding(8));

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickPadding(8));

  // Axis label
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -38)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "0.72rem")
    .attr("fill", "#888")
    .text("Coeficiente de Gini");

  // Labels for reference lines
  const lacLast = lac_gini_ref[lac_gini_ref.length - 1];
  const oecdLast = oecd_gini_ref[oecd_gini_ref.length - 1];

  svg.append("text")
    .attr("x", x(lacLast.year) + 6)
    .attr("y", y(lacLast.value) + 4)
    .attr("font-size", "0.7rem")
    .attr("fill", GREY_DARK)
    .attr("opacity", 0.75)
    .text("Prom. LAC");

  svg.append("text")
    .attr("x", x(oecdLast.year) + 6)
    .attr("y", y(oecdLast.value) + 4)
    .attr("font-size", "0.7rem")
    .attr("fill", GREY_DARK)
    .attr("opacity", 0.6)
    .text("Prom. OCDE");

  svg.append("text")
    .attr("x", x(last.year) + 6)
    .attr("y", y(last.value) + 4)
    .attr("font-size", "0.7rem")
    .attr("fill", PURPLE)
    .attr("font-weight", "600")
    .text("RD 39.0");

  // Gridlines style
  svg.selectAll(".axis .tick line")
    .attr("stroke", "#e5e5e5")
    .attr("stroke-width", 1);
  svg.selectAll(".axis .domain").remove();
}

// ── Chart 2: Horizontal stacked 100% bars — income shares ────────────────────
export function drawChart2(container, income_shares) {
  const margin = { top: 30, right: 30, bottom: 50, left: 180 };
  const width  = Math.min(container.clientWidth, 860) - margin.left - margin.right;
  const height = income_shares.length * 56 + 20;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const quintiles = ["Q1", "Q2", "Q3", "Q4", "Q5"];
  const colors = ["#d5e8d4", "#9cbf9e", "#6b9f71", "#3d7548", "#1e4d29"];
  const drColors = ["#e8d5f5", "#c39bd3", PURPLE_LIGHT, "#9b59b6", PURPLE];

  income_shares.forEach((country, i) => {
    let cumulative = 0;
    const y = i * 56;
    const palette = country.highlight ? drColors : colors;

    // Country label
    svg.append("text")
      .attr("x", -10)
      .attr("y", y + 22)
      .attr("text-anchor", "end")
      .attr("font-size", "0.82rem")
      .attr("font-weight", country.highlight ? "700" : "400")
      .attr("fill", country.highlight ? PURPLE : "#333")
      .text(country.country);

    country.shares.forEach((seg, j) => {
      const barWidth = (seg.share / 100) * width;

      svg.append("rect")
        .attr("x", (cumulative / 100) * width)
        .attr("y", y + 4)
        .attr("width", 0)
        .attr("height", 32)
        .attr("fill", palette[j])
        .transition().delay(j * 80 + i * 40).duration(700).ease(d3.easeCubicOut)
        .attr("width", barWidth);

      // Label inside bar if wide enough
      if (seg.share >= 8) {
        svg.append("text")
          .attr("x", (cumulative / 100) * width + barWidth / 2)
          .attr("y", y + 24)
          .attr("text-anchor", "middle")
          .attr("font-size", "0.7rem")
          .attr("fill", j >= 3 ? "#fff" : "#333")
          .attr("opacity", 0)
          .text(`${seg.share}%`)
          .transition().delay(j * 80 + i * 40 + 500).duration(400)
          .attr("opacity", 1);
      }

      cumulative += seg.share;
    });
  });

  // Legend
  const legendY = income_shares.length * 56 + 10;
  const legendLabels = ["Q1 más pobre", "Q2", "Q3", "Q4", "Q5 más rico"];
  legendLabels.forEach((label, i) => {
    const lx = (i / legendLabels.length) * width;
    svg.append("rect")
      .attr("x", lx).attr("y", legendY)
      .attr("width", 12).attr("height", 12)
      .attr("fill", colors[i]).attr("rx", 2);
    svg.append("text")
      .attr("x", lx + 16).attr("y", legendY + 10)
      .attr("font-size", "0.7rem").attr("fill", "#666")
      .text(label);
  });

  svg.selectAll(".axis .domain, .axis .tick line").remove();
}

// ── Chart 3: PISA by SES quintile — vertical bars with purple gradient ────────
export function drawChart3(container, pisa_by_ses) {
  const margin = { top: 40, right: 30, bottom: 60, left: 55 };
  const width  = Math.min(container.clientWidth, 600) - margin.left - margin.right;
  const height = 340 - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(pisa_by_ses.map(d => d.quintile))
    .range([0, width])
    .padding(0.28);

  const y = d3.scaleLinear()
    .domain([260, 420])
    .range([height, 0]);

  const colorScale = d3.scaleSequential()
    .domain([1, 5])
    .interpolator(d3.interpolateRgb("#e8d5f5", PURPLE));

  // Bars
  svg.selectAll(".bar")
    .data(pisa_by_ses)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.quintile))
    .attr("width", x.bandwidth())
    .attr("y", height)
    .attr("height", 0)
    .attr("fill", d => colorScale(d.quintile))
    .attr("rx", 2)
    .transition().delay((d, i) => i * 100).duration(700).ease(d3.easeCubicOut)
    .attr("y", d => y(d.score))
    .attr("height", d => height - y(d.score));

  // Score labels above bars
  svg.selectAll(".score-label")
    .data(pisa_by_ses)
    .join("text")
    .attr("class", "score-label")
    .attr("x", d => x(d.quintile) + x.bandwidth() / 2)
    .attr("y", d => y(d.score) - 7)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.78rem")
    .attr("font-weight", "600")
    .attr("fill", PURPLE)
    .attr("opacity", 0)
    .text(d => d.score)
    .transition().delay((d, i) => i * 100 + 600).duration(300)
    .attr("opacity", 1);

  // Gap annotation
  const gap = pisa_by_ses[4].score - pisa_by_ses[0].score;
  svg.append("line")
    .attr("x1", x(1) + x.bandwidth() / 2)
    .attr("x2", x(5) + x.bandwidth() / 2)
    .attr("y1", y(pisa_by_ses[0].score) - 24)
    .attr("y2", y(pisa_by_ses[0].score) - 24)
    .attr("stroke", "#aaa")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3 3");

  svg.append("text")
    .attr("x", (x(1) + x.bandwidth() / 2 + x(5) + x.bandwidth() / 2) / 2)
    .attr("y", y(pisa_by_ses[0].score) - 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.7rem")
    .attr("fill", "#555")
    .text(`Brecha: ${gap} puntos`);

  // Axes
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .tickFormat(d => ["Q1\nmás pobre", "Q2", "Q3", "Q4", "Q5\nmás rico"][d - 1])
      .tickSize(0)
      .tickPadding(10));

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickPadding(8));

  svg.selectAll(".axis .tick line").attr("stroke", "#e5e5e5");
  svg.selectAll(".axis .domain").remove();

  // Wrap x-tick text to handle newlines
  svg.selectAll(".axis text").each(function(d) {
    const text = d3.select(this);
    const parts = text.text().split("\n");
    if (parts.length < 2) return;
    text.text("");
    parts.forEach((part, i) => {
      text.append("tspan")
        .attr("x", 0)
        .attr("dy", i === 0 ? "0em" : "1.1em")
        .text(part);
    });
  });
}

// ── Chart 4: Bubble scatter — Gini × PISA × traffic × banking ────────────────
export function drawChart4(container, lac_bubble) {
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width  = container.clientWidth - margin.left - margin.right;
  const height = 440 - margin.top - margin.bottom;

  const wrap = d3.select(container).style("position", "relative");

  const svg = wrap.append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([35, 60]).range([0, width]);
  const y = d3.scaleLinear().domain([330, 430]).range([height, 0]);
  const r = d3.scaleSqrt().domain([0, 70]).range([0, 38]);
  const color = d3.scaleSequential(d3.interpolateBlues).domain([30, 90]);

  // Gridlines
  svg.append("g").attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickPadding(8));
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(-height).tickPadding(8));

  svg.selectAll(".axis .tick line").attr("stroke", "#ebebeb").attr("stroke-dasharray", "3 3");
  svg.selectAll(".axis .domain").remove();

  // Tooltip
  const tooltip = wrap.append("div").attr("class", "bubble-tooltip").style("opacity", 0);

  // Bubbles
  const bubbles = svg.selectAll(".bubble")
    .data(lac_bubble.sort((a, b) => b.traffic_deaths - a.traffic_deaths))
    .join("circle")
    .attr("class", "bubble")
    .attr("cx", d => x(d.gini))
    .attr("cy", d => y(d.pisa_math))
    .attr("r", 0)
    .attr("fill", d => d.highlight ? PURPLE : color(d.banking_pct))
    .attr("stroke", d => d.highlight ? PURPLE : "#aaa")
    .attr("stroke-width", d => d.highlight ? 2 : 1)
    .attr("opacity", d => d.highlight ? 0.92 : 0.72)
    .style("cursor", "pointer")
    .transition().delay((d, i) => i * 60).duration(700).ease(d3.easeElasticOut.amplitude(1).period(0.5))
    .attr("r", d => r(d.traffic_deaths));

  // Country labels — non-DR
  svg.selectAll(".bubble-label")
    .data(lac_bubble.filter(d => !d.highlight))
    .join("text")
    .attr("class", "bubble-label")
    .attr("x", d => x(d.gini))
    .attr("y", d => y(d.pisa_math) - r(d.traffic_deaths) - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem")
    .attr("fill", "#666")
    .text(d => d.iso);

  // DR label — prominent
  const dr = lac_bubble.find(d => d.highlight);
  svg.append("text")
    .attr("x", x(dr.gini))
    .attr("y", y(dr.pisa_math) - r(dr.traffic_deaths) - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.78rem")
    .attr("font-weight", "700")
    .attr("fill", PURPLE)
    .text("RD");

  // Hover
  d3.select(container).selectAll(".bubble")
    .on("mouseover", function(event, d) {
      tooltip.style("opacity", 1)
        .html(`<strong>${d.country}</strong>
          Gini: ${d.gini}<br>
          PISA mat.: ${d.pisa_math}<br>
          Muertes viales: ${d.traffic_deaths}/100k<br>
          Bancarización: ${d.banking_pct}%`);
    })
    .on("mousemove", function(event) {
      const rect = container.getBoundingClientRect();
      tooltip
        .style("left", `${event.clientX - rect.left + 12}px`)
        .style("top",  `${event.clientY - rect.top  - 20}px`);
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
    });

  // Axis labels
  svg.append("text")
    .attr("x", width / 2).attr("y", height + 45)
    .attr("text-anchor", "middle").attr("font-size", "0.72rem").attr("fill", "#888")
    .text("Coeficiente de Gini →  más desigual");

  svg.append("text")
    .attr("x", -height / 2).attr("y", -46)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle").attr("font-size", "0.72rem").attr("fill", "#888")
    .text("Puntaje PISA matemáticas");

  // Legend: bubble size
  const legendX = width - 145;
  const legendY = 10;
  svg.append("text")
    .attr("x", legendX).attr("y", legendY)
    .attr("font-size", "0.68rem").attr("fill", "#888")
    .text("Tamaño = muertes viales/100k");

  [10, 30, 64.6].forEach((v, i) => {
    svg.append("circle")
      .attr("cx", legendX + 20 + i * 40)
      .attr("cy", legendY + 30)
      .attr("r", r(v))
      .attr("fill", "none")
      .attr("stroke", "#bbb")
      .attr("stroke-width", 1);
    svg.append("text")
      .attr("x", legendX + 20 + i * 40)
      .attr("y", legendY + 30 + r(v) + 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.62rem")
      .attr("fill", "#aaa")
      .text(v === 64.6 ? "64.6" : v);
  });
}

// ── Chart 5: GDP per capita vs bottom-50 share — dual Y axis ─────────────────
export function drawChart5(container, growth_vs_bottom) {
  const margin = { top: 40, right: 70, bottom: 40, left: 60 };
  const width  = container.clientWidth - margin.left - margin.right;
  const height = 360 - margin.top - margin.bottom;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(growth_vs_bottom, d => d.year))
    .range([0, width]);

  const yGdp = d3.scaleLinear()
    .domain([0, 11000])
    .range([height, 0]);

  const yShare = d3.scaleLinear()
    .domain([12, 20])
    .range([height, 0]);

  // GDP area
  const gdpArea = d3.area()
    .x(d => x(d.year))
    .y0(height)
    .y1(d => yGdp(d.gdp_per_capita))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(growth_vs_bottom)
    .attr("fill", "#f5a623")
    .attr("opacity", 0.12)
    .attr("d", gdpArea);

  // GDP line
  const gdpLine = d3.line()
    .x(d => x(d.year))
    .y(d => yGdp(d.gdp_per_capita))
    .curve(d3.curveMonotoneX);

  const gdpPath = svg.append("path")
    .datum(growth_vs_bottom)
    .attr("fill", "none")
    .attr("stroke", "#f5a623")
    .attr("stroke-width", 2.5)
    .attr("d", gdpLine);

  const gdpLen = gdpPath.node().getTotalLength();
  gdpPath.attr("stroke-dasharray", `${gdpLen} ${gdpLen}`)
    .attr("stroke-dashoffset", gdpLen)
    .transition().duration(1200).ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0);

  // Bottom-50 share line
  const shareLine = d3.line()
    .x(d => x(d.year))
    .y(d => yShare(d.bottom50_share))
    .curve(d3.curveMonotoneX);

  const sharePath = svg.append("path")
    .datum(growth_vs_bottom)
    .attr("fill", "none")
    .attr("stroke", PURPLE)
    .attr("stroke-width", 2.5)
    .attr("d", shareLine);

  const shareLen = sharePath.node().getTotalLength();
  sharePath.attr("stroke-dasharray", `${shareLen} ${shareLen}`)
    .attr("stroke-dashoffset", shareLen)
    .transition().delay(200).duration(1200).ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0);

  // Axes
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(7).tickSize(0).tickPadding(8));

  svg.append("g")
    .attr("class", "axis axis-left")
    .call(d3.axisLeft(yGdp).ticks(5).tickFormat(d => `$${d3.format(",")(d)}`).tickSize(-width).tickPadding(8));

  svg.append("g")
    .attr("class", "axis axis-right")
    .attr("transform", `translate(${width},0)`)
    .call(d3.axisRight(yShare).ticks(5).tickFormat(d => `${d}%`).tickSize(0).tickPadding(8));

  svg.selectAll(".axis .tick line").attr("stroke", "#e5e5e5");
  svg.selectAll(".axis .domain").remove();

  // Axis labels
  svg.append("text")
    .attr("x", -height / 2).attr("y", -46)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle").attr("font-size", "0.72rem").attr("fill", "#f5a623")
    .text("PIB per cápita (USD corrientes)");

  svg.append("text")
    .attr("x", -height / 2).attr("y", width + 58)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle").attr("font-size", "0.72rem").attr("fill", PURPLE)
    .text("Ingreso: 50% inferior (% total)");

  // End labels
  const lastGdp  = growth_vs_bottom[growth_vs_bottom.length - 1];
  const firstGdp = growth_vs_bottom[0];

  svg.append("text")
    .attr("x", x(lastGdp.year) + 4)
    .attr("y", yGdp(lastGdp.gdp_per_capita) + 4)
    .attr("font-size", "0.7rem").attr("fill", "#f5a623").attr("font-weight", "600")
    .text(`$${d3.format(",")(lastGdp.gdp_per_capita)}`);

  svg.append("text")
    .attr("x", x(lastGdp.year) + 4)
    .attr("y", yShare(lastGdp.bottom50_share) + 4)
    .attr("font-size", "0.7rem").attr("fill", PURPLE).attr("font-weight", "600")
    .text(`${lastGdp.bottom50_share}%`);
}
