import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PURPLE   = "#8e44ad";
const PURPLE_2 = "#a569bd";
const PURPLE_3 = "#d2b4de";
const PURPLE_4 = "#f0e6f6";
const GREEN    = "#27ae60";
const ORANGE   = "#e67e22";
const RED      = "#c0392b";
const GREY     = "#ccc";
const GREY_MED = "#aaa";

function removeDomain(svg) {
  svg.selectAll(".axis .domain").remove();
  svg.selectAll(".axis .tick line").attr("stroke", "#e5e5e5");
}

// ── Chart 1: Income distribution — horizontal bar chart ───────────────────────
export function drawChart1(container, data) {
  const margin = { top: 20, right: 180, bottom: 40, left: 145 };
  const width  = Math.min(container.clientWidth, 860) - margin.left - margin.right;
  const rowH   = 58;
  const height = data.length * rowH;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colorMap = {
    "Top 1%":       PURPLE,
    "Siguiente 9%": PURPLE_2,
    "Medio 40%":    PURPLE_3,
    "Bottom 50%":   PURPLE_4
  };

  const x = d3.scaleLinear().domain([0, 35]).range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.group))
    .range([0, height])
    .padding(0.22);

  // gridlines
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`).tickSize(-height).tickPadding(8));

  removeDomain(svg);
  svg.selectAll(".axis .tick line").attr("stroke", "#ebebeb").attr("stroke-dasharray", "3 3");

  // bars
  svg.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", d => y(d.group))
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", d => colorMap[d.group])
    .attr("stroke", d => d.group === "Bottom 50%" ? "#c8b2db" : "none")
    .attr("stroke-width", 1)
    .attr("rx", 2)
    .transition()
    .delay((d, i) => i * 130)
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr("width", d => x(d.share));

  // group labels (left)
  svg.selectAll(".group-label")
    .data(data)
    .join("text")
    .attr("class", "group-label")
    .attr("x", -10)
    .attr("y", d => y(d.group) + y.bandwidth() / 2 - 7)
    .attr("text-anchor", "end")
    .attr("font-size", d => d.group === "Top 1%" ? "0.85rem" : "0.78rem")
    .attr("font-weight", d => d.group === "Top 1%" ? "700" : "400")
    .attr("fill", d => d.group === "Top 1%" ? PURPLE : "#333")
    .text(d => d.group);

  // population sub-label
  svg.selectAll(".pop-label")
    .data(data)
    .join("text")
    .attr("class", "pop-label")
    .attr("x", -10)
    .attr("y", d => y(d.group) + y.bandwidth() / 2 + 8)
    .attr("text-anchor", "end")
    .attr("font-size", "0.63rem")
    .attr("fill", "#999")
    .text(d => `${d.population_pct}% de la población`);

  // share value labels at bar end
  svg.selectAll(".share-label")
    .data(data)
    .join("text")
    .attr("class", "share-label")
    .attr("x", d => x(d.share) + 8)
    .attr("y", d => y(d.group) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-size", "0.9rem")
    .attr("font-weight", "700")
    .attr("fill", d => d.group === "Top 1%" ? PURPLE : "#555")
    .attr("opacity", 0)
    .text(d => `${d.share}%`)
    .transition()
    .delay((d, i) => i * 130 + 680)
    .duration(300)
    .attr("opacity", 1);

  // annotation bracket: Top 1% vs Bottom 50%
  const top1  = data.find(d => d.group === "Top 1%");
  const bot50 = data.find(d => d.group === "Bottom 50%");
  if (top1 && bot50) {
    const bx  = width + 30;
    const y1  = y(top1.group) + y.bandwidth() / 2;
    const y2  = y(bot50.group) + y.bandwidth() / 2;
    const mid = (y1 + y2) / 2;
    const tk  = 6;

    [y1, y2].forEach(yy => {
      svg.append("line")
        .attr("x1", bx).attr("x2", bx + tk)
        .attr("y1", yy).attr("y2", yy)
        .attr("stroke", "#bbb").attr("stroke-width", 1);
    });
    svg.append("line")
      .attr("x1", bx + tk).attr("x2", bx + tk)
      .attr("y1", y1).attr("y2", y2)
      .attr("stroke", "#bbb").attr("stroke-width", 1);

    ["El 1% recibe", "más que el", "50% combinado"].forEach((line, i) => {
      svg.append("text")
        .attr("x", bx + tk + 8)
        .attr("y", mid - 12 + i * 13)
        .attr("font-size", "0.6rem")
        .attr("fill", "#555")
        .text(line);
    });
  }
}

// ── Chart 2: Global comparison — dual dot plot ────────────────────────────────
export function drawChart2(container, data) {
  const sorted = [...data].sort((a, b) => b.top1_share - a.top1_share);

  const margin = { top: 38, right: 40, bottom: 40, left: 200 };
  const width  = Math.min(container.clientWidth, 860) - margin.left - margin.right;
  const rowH   = 36;
  const height = sorted.length * rowH;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 65]).range([0, width]);

  const y = d3.scaleBand()
    .domain(sorted.map(d => d.iso))
    .range([0, height])
    .padding(0.25);

  // gridlines
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => `${d}%`).tickSize(-height).tickPadding(8));

  removeDomain(svg);
  svg.selectAll(".axis .tick line").attr("stroke", "#ebebeb").attr("stroke-dasharray", "3 3");

  // US top 1% reference line at 19%
  svg.append("line")
    .attr("x1", x(19)).attr("x2", x(19))
    .attr("y1", -20).attr("y2", height)
    .attr("stroke", "#ccc").attr("stroke-width", 1)
    .attr("stroke-dasharray", "4 3");

  svg.append("text")
    .attr("x", x(19)).attr("y", -24)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.58rem")
    .attr("fill", "#aaa")
    .text("EE.UU. top 1%: 19%");

  // connecting lines
  svg.selectAll(".connect-line")
    .data(sorted)
    .join("line")
    .attr("class", "connect-line")
    .attr("x1", d => x(d.top1_share))
    .attr("x2", d => x(d.top1_share))
    .attr("y1", d => y(d.iso) + y.bandwidth() / 2)
    .attr("y2", d => y(d.iso) + y.bandwidth() / 2)
    .attr("stroke", d => d.highlight ? PURPLE_3 : "#ddd")
    .attr("stroke-width", d => d.highlight ? 2 : 1.5)
    .transition()
    .delay((d, i) => i * 50)
    .duration(600)
    .ease(d3.easeCubicOut)
    .attr("x2", d => x(d.top10_share));

  // top 1% dots (left, darker)
  svg.selectAll(".dot-top1")
    .data(sorted)
    .join("circle")
    .attr("class", "dot-top1")
    .attr("cx", d => x(d.top1_share))
    .attr("cy", d => y(d.iso) + y.bandwidth() / 2)
    .attr("r", 0)
    .attr("fill", d => d.highlight ? PURPLE : GREY)
    .attr("stroke", d => d.highlight ? "#fff" : "none")
    .attr("stroke-width", 1.5)
    .transition()
    .delay((d, i) => i * 50 + 300)
    .duration(300)
    .attr("r", d => d.highlight ? 8 : 5);

  // top 10% dots (right, lighter)
  svg.selectAll(".dot-top10")
    .data(sorted)
    .join("circle")
    .attr("class", "dot-top10")
    .attr("cx", d => x(d.top10_share))
    .attr("cy", d => y(d.iso) + y.bandwidth() / 2)
    .attr("r", 0)
    .attr("fill", d => d.highlight ? PURPLE_2 : GREY_MED)
    .attr("stroke", d => d.highlight ? "#fff" : "none")
    .attr("stroke-width", 1.5)
    .attr("opacity", 0.85)
    .transition()
    .delay((d, i) => i * 50 + 450)
    .duration(300)
    .attr("r", d => d.highlight ? 7 : 4);

  // country labels
  svg.selectAll(".country-label")
    .data(sorted)
    .join("text")
    .attr("class", "country-label")
    .attr("x", -10)
    .attr("y", d => y(d.iso) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .attr("font-size", d => d.highlight ? "0.82rem" : "0.75rem")
    .attr("font-weight", d => d.highlight ? "700" : "400")
    .attr("fill", d => d.highlight ? PURPLE : "#444")
    .text(d => {
      if (d.iso === "US")  return "Estados Unidos";
      if (d.iso === "NOR") return "Países Nórdicos";
      return d.country;
    });

  // legend
  const lx = 8;
  const ly = -32;

  svg.append("circle").attr("cx", lx + 5).attr("cy", ly + 5).attr("r", 5).attr("fill", GREY);
  svg.append("text").attr("x", lx + 14).attr("y", ly + 9).attr("font-size", "0.65rem").attr("fill", "#555").text("Top 1%");

  svg.append("circle").attr("cx", lx + 80).attr("cy", ly + 5).attr("r", 4).attr("fill", GREY_MED).attr("opacity", 0.85);
  svg.append("text").attr("x", lx + 92).attr("y", ly + 9).attr("font-size", "0.65rem").attr("fill", "#555").text("Top 10%");

  svg.append("circle").attr("cx", lx + 164).attr("cy", ly + 5).attr("r", 7).attr("fill", PURPLE).attr("stroke", "#fff").attr("stroke-width", 1.5);
  svg.append("text").attr("x", lx + 176).attr("y", ly + 9).attr("font-size", "0.65rem").attr("fill", PURPLE).attr("font-weight", "700").text("Rep. Dominicana");
}

// ── Chart 3: Informality by education — stacked horizontal bar ────────────────
export function drawChart3(container, data) {
  const margin = { top: 28, right: 100, bottom: 44, left: 180 };
  const width  = Math.min(container.clientWidth, 860) - margin.left - margin.right;
  const rowH   = 46;
  const height = data.length * rowH;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.education))
    .range([0, height])
    .padding(0.2);

  // x axis with gridlines
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`).tickSize(-height).tickPadding(8));

  removeDomain(svg);
  svg.selectAll(".axis .tick line").attr("stroke", "#ebebeb").attr("stroke-dasharray", "3 3");

  // formal bars (green)
  svg.selectAll(".bar-formal")
    .data(data)
    .join("rect")
    .attr("class", "bar-formal")
    .attr("x", 0)
    .attr("y", d => y(d.education))
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", GREEN)
    .attr("opacity", 0.9)
    .attr("rx", 2)
    .transition()
    .delay((d, i) => i * 90)
    .duration(600)
    .ease(d3.easeCubicOut)
    .attr("width", d => x(d.formal_pct));

  // informal bars (orange)
  svg.selectAll(".bar-informal")
    .data(data)
    .join("rect")
    .attr("class", "bar-informal")
    .attr("x", d => x(d.formal_pct))
    .attr("y", d => y(d.education))
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", ORANGE)
    .attr("opacity", 0.82)
    .transition()
    .delay((d, i) => i * 90)
    .duration(600)
    .ease(d3.easeCubicOut)
    .attr("width", d => x(d.informal_pct));

  // labels inside formal (if > 15%)
  svg.selectAll(".lbl-formal")
    .data(data.filter(d => d.formal_pct > 15))
    .join("text")
    .attr("class", "lbl-formal")
    .attr("x", d => x(d.formal_pct) / 2)
    .attr("y", d => y(d.education) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem")
    .attr("font-weight", "600")
    .attr("fill", "#fff")
    .attr("opacity", 0)
    .text(d => `${d.formal_pct}%`)
    .transition()
    .delay((d, i) => i * 90 + 580)
    .duration(300)
    .attr("opacity", 1);

  // labels inside informal (if > 15%)
  svg.selectAll(".lbl-informal")
    .data(data.filter(d => d.informal_pct > 15))
    .join("text")
    .attr("class", "lbl-informal")
    .attr("x", d => x(d.formal_pct) + x(d.informal_pct) / 2)
    .attr("y", d => y(d.education) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .attr("font-size", "0.68rem")
    .attr("font-weight", "600")
    .attr("fill", "#fff")
    .attr("opacity", 0)
    .text(d => `${d.informal_pct}%`)
    .transition()
    .delay((d, i) => i * 90 + 580)
    .duration(300)
    .attr("opacity", 1);

  // education level labels (left)
  svg.selectAll(".edu-label")
    .data(data)
    .join("text")
    .attr("class", "edu-label")
    .attr("x", -10)
    .attr("y", d => y(d.education) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .attr("font-size", "0.78rem")
    .attr("fill", "#333")
    .text(d => d.education);

  // national average reference line at 54.7%
  svg.append("line")
    .attr("x1", x(54.7)).attr("x2", x(54.7))
    .attr("y1", -14).attr("y2", height)
    .attr("stroke", "#888").attr("stroke-width", 1.3)
    .attr("stroke-dasharray", "5 3");

  svg.append("text")
    .attr("x", x(54.7)).attr("y", -18)
    .attr("text-anchor", "middle")
    .attr("font-size", "0.6rem")
    .attr("fill", "#666")
    .text("Promedio nacional: 54.7% informal");

  // right-side annotations
  const sinEdu = data.find(d => d.education === "Sin educación");
  const univ   = data.find(d => d.education === "Universidad");

  if (sinEdu) {
    svg.append("text")
      .attr("x", width + 8)
      .attr("y", y(sinEdu.education) + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "0.63rem")
      .attr("font-weight", "700")
      .attr("fill", ORANGE)
      .text("88% informal");
  }
  if (univ) {
    svg.append("text")
      .attr("x", width + 8)
      .attr("y", y(univ.education) + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "0.63rem")
      .attr("font-weight", "700")
      .attr("fill", GREEN)
      .text("27% informal");
  }

  // legend
  const ly = height + 30;
  const startX = width / 2 - 130;

  svg.append("rect").attr("x", startX).attr("y", ly).attr("width", 13).attr("height", 13).attr("fill", GREEN).attr("opacity", 0.9).attr("rx", 2);
  svg.append("text").attr("x", startX + 17).attr("y", ly + 10).attr("font-size", "0.7rem").attr("fill", "#555").text("Empleo formal");

  svg.append("rect").attr("x", startX + 130).attr("y", ly).attr("width", 13).attr("height", 13).attr("fill", ORANGE).attr("opacity", 0.85).attr("rx", 2);
  svg.append("text").attr("x", startX + 147).attr("y", ly + 10).attr("font-size", "0.7rem").attr("fill", "#555").text("Empleo informal");
}

// ── Chart 4: Tax gap — horizontal bar chart ───────────────────────────────────
export function drawChart4(container, data) {
  const margin = { top: 32, right: 70, bottom: 30, left: 240 };
  const width  = Math.min(container.clientWidth, 760) - margin.left - margin.right;
  const rowH   = 54;
  const height = data.length * rowH;

  const svg = d3.select(container)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // diagonal stripe fill for evasion bar
  const uid = "stripe-" + Math.random().toString(36).slice(2, 7);
  const pat = svg.append("defs").append("pattern")
    .attr("id", uid)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 7)
    .attr("height", 7)
    .attr("patternTransform", "rotate(45)");

  pat.append("rect").attr("width", 7).attr("height", 7).attr("fill", "#fff5f5");
  pat.append("line")
    .attr("x1", 0).attr("y1", 0)
    .attr("x2", 0).attr("y2", 7)
    .attr("stroke", RED)
    .attr("stroke-width", 2.5)
    .attr("opacity", 0.65);

  const x = d3.scaleLinear().domain([0, 38]).range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, height])
    .padding(0.28);

  // gridlines
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`).tickSize(-height).tickPadding(8));

  removeDomain(svg);
  svg.selectAll(".axis .tick line").attr("stroke", "#ebebeb").attr("stroke-dasharray", "3 3");

  // bars
  svg.selectAll(".hbar")
    .data(data)
    .join("rect")
    .attr("class", "hbar")
    .attr("x", 0)
    .attr("y", d => y(d.label))
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", d => {
      if (d.type === "actual")  return PURPLE;
      if (d.type === "lac_avg") return GREY;
      if (d.type === "oecd_avg") return GREY_MED;
      return `url(#${uid})`;
    })
    .attr("stroke", d => d.type === "evasion" ? RED : "none")
    .attr("stroke-width", d => d.type === "evasion" ? 1.8 : 0)
    .attr("stroke-dasharray", d => d.type === "evasion" ? "4 2" : "none")
    .attr("rx", 2)
    .attr("opacity", 0.9)
    .transition()
    .delay((d, i) => i * 120)
    .duration(700)
    .ease(d3.easeCubicOut)
    .attr("width", d => x(d.value));

  // left labels
  svg.selectAll(".bar-label")
    .data(data)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", -10)
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .attr("font-size", "0.77rem")
    .attr("font-weight", d => (d.type === "actual" || d.type === "evasion") ? "700" : "400")
    .attr("fill", d => {
      if (d.type === "actual")  return PURPLE;
      if (d.type === "evasion") return RED;
      return "#444";
    })
    .text(d => d.label);

  // value labels at bar end
  svg.selectAll(".val-label")
    .data(data)
    .join("text")
    .attr("class", "val-label")
    .attr("x", d => x(d.value) + 8)
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-size", "0.85rem")
    .attr("font-weight", "700")
    .attr("fill", d => {
      if (d.type === "actual")  return PURPLE;
      if (d.type === "evasion") return RED;
      return "#666";
    })
    .attr("opacity", 0)
    .text(d => `${d.value}%`)
    .transition()
    .delay((d, i) => i * 120 + 680)
    .duration(300)
    .attr("opacity", 1);

  // gap annotation between actual (13.2%) and LAC (23.1%)
  const actual = data.find(d => d.type === "actual");
  const lac    = data.find(d => d.type === "lac_avg");
  if (actual && lac) {
    const midY = (y(actual.label) + y.bandwidth() + y(lac.label)) / 2;
    const x1 = x(actual.value);
    const x2 = x(lac.value);
    const mid = (x1 + x2) / 2;
    const ay = midY;

    svg.append("line")
      .attr("x1", x1).attr("x2", x2)
      .attr("y1", ay).attr("y2", ay)
      .attr("stroke", "#bbb").attr("stroke-width", 1);

    [x1, x2].forEach(px => {
      svg.append("line")
        .attr("x1", px).attr("x2", px)
        .attr("y1", ay - 4).attr("y2", ay + 4)
        .attr("stroke", "#bbb").attr("stroke-width", 1);
    });

    svg.append("text")
      .attr("x", mid).attr("y", ay - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.6rem")
      .attr("fill", "#666")
      .text("Brecha con LAC: 9.9 pts del PIB");
  }

  // callout box below chart
  d3.select(container).append("div")
    .attr("class", "chart-callout chart-callout--rojo")
    .html("El <strong>63%</strong> del impuesto sobre la renta se evade. El <strong>47%</strong> del IVA.");
}
