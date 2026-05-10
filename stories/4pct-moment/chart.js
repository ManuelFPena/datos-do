import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawChart(container, data) {
  const margin = { top: 40, right: 80, bottom: 40, left: 50 };
  const totalHeight = 420;
  const width  = container.clientWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom;

  const ACCENT = "#c0392b";
  const THRESHOLD = 4;

  const svg = d3.select(container)
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", totalHeight)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) * 1.15])
    .range([height, 0])
    .nice();

  // 4% reference line
  svg.append("line")
    .attr("x1", 0).attr("x2", width)
    .attr("y1", y(THRESHOLD)).attr("y2", y(THRESHOLD))
    .attr("stroke", "#aaa")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4 3");

  svg.append("text")
    .attr("x", width + 4)
    .attr("y", y(THRESHOLD) + 4)
    .attr("font-size", "0.7rem")
    .attr("fill", "#999")
    .text("4%");

  // Shaded region after 2013
  const x2013 = x(2013);
  svg.append("rect")
    .attr("x", x2013)
    .attr("y", 0)
    .attr("width", width - x2013)
    .attr("height", height)
    .attr("fill", "rgba(192,57,43,0.05)");

  // Axes
  const xAxis = d3.axisBottom(x)
    .tickFormat(d3.format("d"))
    .ticks(8)
    .tickSize(-height);

  const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => d + "%")
    .tickSize(-width);

  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll(".tick line")
      .attr("stroke", "#eee");

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis)
    .selectAll(".tick line")
      .attr("stroke", "#eee");

  // Remove domain lines
  svg.selectAll(".domain").remove();

  // Line
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .defined(d => d.value != null)
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", ACCENT)
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // Dots for annotated points
  const annotated = data.filter(d => d.annotation);

  svg.selectAll(".dot-annotated")
    .data(annotated)
    .join("circle")
      .attr("class", "dot-annotated")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", ACCENT)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

  // Annotations
  annotated.forEach(d => {
    const cx = x(d.year);
    const cy = y(d.value);
    const above = d.year === 2020;
    const labelY = above ? cy - 28 : cy + 28;
    const labelX = d.year >= 2018 ? cx - 8 : cx + 8;
    const anchor = d.year >= 2018 ? "end" : "start";

    svg.append("line")
      .attr("x1", cx).attr("y1", above ? cy - 6 : cy + 6)
      .attr("x2", cx).attr("y2", above ? cy - 22 : cy + 22)
      .attr("stroke", "#555")
      .attr("stroke-width", 1);

    svg.append("text")
      .attr("x", labelX)
      .attr("y", labelY)
      .attr("font-size", "0.68rem")
      .attr("fill", "#333")
      .attr("text-anchor", anchor)
      .text(`${d.year}: ${d.annotation}`);
  });

  // 1997 law marker
  svg.append("line")
    .attr("x1", x(1997)).attr("x2", x(1997))
    .attr("y1", 0).attr("y2", height)
    .attr("stroke", "#bbb")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3 3");

  svg.append("text")
    .attr("x", x(1997) + 4)
    .attr("y", 12)
    .attr("font-size", "0.65rem")
    .attr("fill", "#999")
    .text("Ley 66-97 aprobada");
}
