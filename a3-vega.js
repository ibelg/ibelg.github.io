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

  // Check which containers exist on the page (so this file can be reused)
  const hasViz1 = document.getElementById("vg-viz1");
  const hasViz1b = document.getElementById("vg-viz1b");
  const hasViz1c = document.getElementById("vg-viz1c");
  const hasViz2 = document.getElementById("vg-viz2");
  const hasViz3 = document.getElementById("vg-viz3");
  const hasViz3b = document.getElementById("vg-viz3b");
  const hasViz4 = document.getElementById("vg-viz4");
  const hasViz4b = document.getElementById("vg-viz4b");

  if (
    !hasViz1 &&
    !hasViz1b &&
    !hasViz1c &&
    !hasViz2 &&
    !hasViz3 &&
    !hasViz3b &&
    !hasViz4 &&
    !hasViz4b
  ) {
    return;
  }

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
     VISUALIZATION 1B
     Average Global Sales per Game (Top Platforms per Genre)
  ===================================================== */

  const viz1bSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Average Global Sales per Game (Top Platforms per Genre)",
    data: { values: games },
    transform: [
      {
        aggregate: [{ op: "mean", field: "Global_Sales", as: "avgSales" }],
        groupby: ["Genre", "Platform"]
      },
      {
        window: [{ op: "rank", as: "rank" }],
        groupby: ["Genre"],
        sort: [{ field: "avgSales", order: "descending" }]
      },
      { filter: "datum.rank <= 3" }
    ],
    mark: "bar",
    encoding: {
      y: { field: "Genre", type: "nominal", title: "Genre" },
      x: {
        field: "avgSales",
        type: "quantitative",
        title: "Average Global Sales per Game (M)"
      },
      color: { field: "Platform", type: "nominal", title: "Platform" },
      tooltip: [
        { field: "Genre", type: "nominal" },
        { field: "Platform", type: "nominal" },
        { field: "avgSales", type: "quantitative", title: "Avg Sales (M)", format: ".2f" }
      ]
    },
    width: 760,
    height: 360
  };

  await render("#vg-viz1b", viz1bSpec);

  /* =====================================================
     VISUALIZATION 1C
     Platform Sales Lifespan (Years Above 20% of Peak Sales)
  ===================================================== */

  const viz1cSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Platform Sales Lifespan (Years Above 20% of Peak Sales)",
    data: { values: games },
    transform: [
      {
        aggregate: [{ op: "sum", field: "Global_Sales", as: "yearSales" }],
        groupby: ["Platform", "Year"]
      },
      {
        joinaggregate: [{ op: "max", field: "yearSales", as: "peakSales" }],
        groupby: ["Platform"]
      },
      { calculate: "0.2 * datum.peakSales", as: "threshold" },
      { filter: "datum.yearSales >= datum.threshold" },
      {
        aggregate: [{ op: "count", as: "lifespanYears" }],
        groupby: ["Platform"]
      },
      { filter: "datum.lifespanYears >= 3" }
    ],
    mark: "bar",
    encoding: {
      y: { field: "Platform", type: "nominal", sort: "-x", title: "Platform" },
      x: {
        field: "lifespanYears",
        type: "quantitative",
        title: "Years Above 20% of Peak Sales"
      },
      tooltip: [
        { field: "Platform", type: "nominal" },
        { field: "lifespanYears", type: "quantitative", title: "Lifespan (Years)" }
      ]
    },
    width: 760,
    height: 520
  };

  await render("#vg-viz1c", viz1cSpec);

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
     VISUALIZATION 3A
     Regional Sales by Platform (small multiples)
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
     VISUALIZATION 3B
     Regional Platform Specialization (Top 20 platforms)
  ===================================================== */

  const viz3bSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Regional Platform Specialization (Share in Region vs Global Baseline)",
    data: { values: games },
    transform: [
      { fold: ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"], as: ["Region", "Sales"] },

      {
        aggregate: [{ op: "sum", field: "Sales", as: "PR_Sales" }],
        groupby: ["Platform", "Region"]
      },

      {
        joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Region_Total" }],
        groupby: ["Region"]
      },

      {
        joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Platform_Total" }],
        groupby: ["Platform"]
      },

      { joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Global_Total" }] },

      { calculate: "datum.PR_Sales / datum.Region_Total", as: "Region_Share" },
      { calculate: "datum.Platform_Total / datum.Global_Total", as: "Global_Share" },

      { calculate: "datum.Region_Share / datum.Global_Share", as: "Specialization" },

      {
        window: [{ op: "rank", as: "pRank" }],
        sort: [{ field: "Platform_Total", order: "descending" }]
      },
      { filter: "datum.pRank <= 20" }
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

  await render("#vg-viz3b", viz3bSpec);

  /* =====================================================
     VISUALIZATION 4
     Regional Platform Specialization (full heatmap)
     (kept for compatibility if you still use #vg-viz4)
  ===================================================== */

  const viz4Spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Regional Platform Specialization (Share in Region vs Global Baseline)",
    data: { values: games },
    transform: [
      { fold: ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"], as: ["Region", "Sales"] },

      {
        aggregate: [{ op: "sum", field: "Sales", as: "PR_Sales" }],
        groupby: ["Platform", "Region"]
      },

      {
        joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Region_Total" }],
        groupby: ["Region"]
      },

      {
        joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Platform_Total" }],
        groupby: ["Platform"]
      },

      { joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Global_Total" }] },

      { calculate: "datum.PR_Sales / datum.Region_Total", as: "Region_Share" },
      { calculate: "datum.Platform_Total / datum.Global_Total", as: "Global_Share" },

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

  /* =====================================================
     VISUALIZATION 4B
     Global Gaming Culture Flow: Regional Dominance vs Localization
  ===================================================== */

  const viz4bSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Global Gaming Culture Flow: Regional Dominance vs Localization",
    data: { values: games },
    transform: [
      { fold: ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"], as: ["Region", "Sales"] },

      // Total sales per region & platform
      {
        aggregate: [{ op: "sum", field: "Sales", as: "PR_Sales" }],
        groupby: ["Region", "Platform"]
      },

      // Total sales per region
      {
        joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Region_Total" }],
        groupby: ["Region"]
      },

      // Global total
      { joinaggregate: [{ op: "sum", field: "PR_Sales", as: "Global_Total" }] },

      // Region share of global gaming market
      { calculate: "datum.Region_Total / datum.Global_Total", as: "Region_Global_Share" }
    ],
    mark: "bar",
    encoding: {
      x: { field: "Region", type: "nominal", title: "Region" },
      y: {
        field: "Region_Global_Share",
        type: "quantitative",
        title: "Share of Global Sales",
        axis: { format: "%" }
      },
      color: { field: "Region", type: "nominal", legend: null },
      tooltip: [
        { field: "Region", type: "nominal" },
        { field: "Region_Global_Share", type: "quantitative", format: ".1%" }
      ]
    },
    width: 420,
    height: 360
  };

  await render("#vg-viz4b", viz4bSpec);
})();
