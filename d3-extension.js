import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let svg;
let circlesData = [];

const width = 800;
const height = 600;
const maxCircles = 10;
const duration = 500;

async function prepareVis() {
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

  // Click anywhere on the SVG to add a new circle
  svg.on("click", function (event) {
    const [x, y] = d3.pointer(event);

    if (circlesData.length >= maxCircles) {
      circlesData.shift();
    }

    circlesData.push({
      x: x,
      y: y,
      r: Math.random() * 20 + 10,
      fill: d3.interpolateCool(Math.random())
    });

    updateVis();
  });
}

async function drawVis() {
  updateVis();
}

function updateVis() {
  const circles = svg.selectAll("circle").data(circlesData);

  circles
    .exit()
    .transition()
    .duration(duration)
    .attr("r", 0)
    .style("opacity", 0)
    .remove();

  circles
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 0)
    .attr("fill", d => d.fill)
    .attr("opacity", 0.85)
    .attr("stroke", "#111111")
    .attr("stroke-width", 1)
    .transition()
    .duration(duration)
    .attr("r", d => d.r);

  circles
    .transition()
    .duration(duration)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.r)
    .attr("fill", d => d.fill);
}

async function runApp() {
  await prepareVis();
  await drawVis();
}

runApp();