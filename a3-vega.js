// a3-vega.js
// Vega-Lite charts for IAT355 Assignment 3

(async function () {
    "use strict";
  
    async function loadGames() {
      const res = await fetch("dataset/videogames_wide.csv");
      if (!res.ok) {
        console.error("Dataset not found at dataset/videogames_wide.csv");
        return [];
      }
      const text = await res.text();
      return d3.csvParse(text, d3.autoType);
    }
  
    function render(container, spec) {
      const el = document.querySelector(container);
      if (!el) return;
      return vegaEmbed(container, spec, { actions: false });
    }
  
    const hasViz1 = document.getElementById("vg-viz1");
    const hasViz2 = document.getElementById("vg-viz2");
    const hasViz3 = document.getElementById("vg-viz3");
    const hasViz4 = document.getElementById("vg-viz4");
  
    if (!hasViz1 && !hasViz2 && !hasViz3 && !hasViz4) return;
  
    const games = await loadGames();
  
    /* =====================================================
       VISUALIZATION 1
       Global Sales by Genre & Platform
    ===================================================== */
  
    const viz1Spec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title: "Global Sales by Genre and Platform",
      data: { values: games },
      transform: [
        {
          aggregate: [{ op: "sum", field: "Global_Sales", as: "Total_Sales" }],
          groupby: ["Genre", "Platform"]
        }
      ],
      mark: "bar",
      encoding: {
        y: { field: "Genre", type: "nominal", sort: "-x", title: "Genre" },
        x: { field: "Total_Sales", type: "quantitative", title: "Global Sales (Millions)" },
        color: { field: "Platform", type: "nominal", title: "Platform" },
        tooltip: [
          { field: "Genre", type: "nominal" },
          { field: "Platform", type: "nominal" },
          { field: "Total_Sales", type: "quantitative", title: "Sales (M)", format: ".2f" }
        ]
      },
      width: 760,
      height: 360
    };
  
    await render("#vg-viz1", viz1Spec);
  
    /* =====================================================
       VISUALIZATION 2
       Genre Mix Over Time (Platform selector)
    ===================================================== */
  
    const platformOptions = Array.from(new Set(games.map((d) => d.Platform)))
      .filter(Boolean)
      .sort();
  
    const defaultPlatform = platformOptions.includes("PS2") ? "PS2" : platformOptions[0];
  
    const viz2Spec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title: "Genre Mix Over Time (Share of Platform Sales)",
      data: { values: games },
      params: [
        {
          name: "platformPick",
          value: defaultPlatform,
          bind: {
            input: "select",
            options: platformOptions,
            name: "Pick a platform: "
          }
        }
      ],
      transform: [
        { filter: "datum.Platform === platformPick" },
        { calculate: "toDate(datum.Year + '-01-01')", as: "YearDate" },
        {
          aggregate: [{ op: "sum", field: "Global_Sales", as: "GenreSales" }],
          groupby: ["YearDate", "Genre"]
        },
        {
          joinaggregate: [{ op: "sum", field: "GenreSales", as: "YearTotal" }],
          groupby: ["YearDate"]
        },
        { calculate: "datum.GenreSales / datum.YearTotal", as: "Share" }
      ],
      mark: { type: "area" },
      encoding: {
        x: { field: "YearDate", type: "temporal", title: "Year" },
        y: {
          field: "Share",
          type: "quantitative",
          stack: "normalize",
          axis: { format: "%" },
          title: "Share of Platform’s Global Sales"
        },
        color: { field: "Genre", type: "nominal", title: "Genre" },
        tooltip: [
          { field: "YearDate", type: "temporal", title: "Year" },
          { field: "Genre", type: "nominal" },
          { field: "Share", type: "quantitative", title: "Share", format: ".0%" },
          { field: "GenreSales", type: "quantitative", title: "Sales (M)", format: ".2f" }
        ]
      },
      width: 760,
      height: 360
    };
  
    await render("#vg-viz2", viz2Spec);
  
    /* =====================================================
       VISUALIZATION 3
       Regional Sales vs Platform (small multiples)
    ===================================================== */
  
    const viz3Spec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title: "Regional Sales by Platform",
      data: { values: games },
      transform: [
        { fold: ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"], as: ["Region", "Sales"] },
        {
          aggregate: [{ op: "sum", field: "Sales", as: "Total_Sales" }],
          groupby: ["Platform", "Region"]
        }
      ],
      facet: { field: "Region", type: "nominal", title: "Region" },
      spec: {
        mark: "bar",
        encoding: {
          y: { field: "Platform", type: "nominal", sort: "-x", title: "Platform" },
          x: { field: "Total_Sales", type: "quantitative", title: "Sales (Millions)" },
          color: { field: "Platform", type: "nominal", legend: null },
          tooltip: [
            { field: "Region", type: "nominal" },
            { field: "Platform", type: "nominal" },
            { field: "Total_Sales", type: "quantitative", title: "Sales (M)", format: ".2f" }
          ]
        }
      },
      columns: 2,
      width: 280,
      height: 240
    };
  
    await render("#vg-viz3", viz3Spec);
  
    /* =====================================================
       VISUALIZATION 4
       Regional Platform Specialization (IR-focused heatmap)
    ===================================================== */
  
    const viz4Spec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      title: "Regional Platform Specialization (Share in Region vs Global Baseline)",
      data: { values: games },
      transform: [
        // Convert wide regions into long format
        { fold: ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"], as: ["Region", "Sales"] },
  
        // Total platform sales per region
        {
          aggregate: [{ op: "sum", field: "Sales", as: "PR_Sales" }],
          groupby: ["Platform", "Region"]
        },
  
        // Total sales per region
        {
          joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Region_Total" }],
          groupby: ["Region"]
        },
  
        // Total sales per platform (global)
        {
          joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Platform_Total" }],
          groupby: ["Platform"]
        },
  
        // Global total sales
        { joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Global_Total" }] },
  
        // Shares
        { calculate: "datum.PR_Sales / datum.Region_Total", as: "Region_Share" },
        { calculate: "datum.Platform_Total / datum.Global_Total", as: "Global_Share" },
  
        // Specialization index
        { calculate: "datum.Region_Share / datum.Global_Share", as: "Specialization" }
      ],
      mark: "rect",
      encoding: {
        x: { field: "Region", type: "nominal", title: "Region" },
        y: { field: "Platform", type: "nominal", title: "Platform" },
        color: {
          field: "Specialization",
          type: "quantitative",
          title: "Specialization Index"
        },
        tooltip: [
          { field: "Region", type: "nominal" },
          { field: "Platform", type: "nominal" },
          { field: "Specialization", type: "quantitative", title: "Specialization", format: ".2f" },
          { field: "Region_Share", type: "quantitative", title: "Region Share", format: ".1%" },
          { field: "Global_Share", type: "quantitative", title: "Global Baseline", format: ".1%" }
        ]
      },
      width: 760,
      height: 520
    };
  
    await render("#vg-viz4", viz4Spec);
  })();
  