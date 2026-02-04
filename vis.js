/* vis.js
 SVG DRAWINGS AND VISUALIZATIONS:
   1) A simple SVG bar chart (16-week marathon plan)
   2) A little interactive SVG “game” (Hello Kitty follows your mouse and eats strawberries)

   main.js calls the public functions at the bottom (window.Vis.*)
*/

(function () {
    "use strict";
  
    const SVG_NS = "http://www.w3.org/2000/svg";
  
    /* =========================================================
       Tiny helpers (so the SVG code stays readable)
    ========================================================= */
  
    // Create an SVG element + set attributes in one go
    function el(name, attrs = {}) {
      const node = document.createElementNS(SVG_NS, name);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
      return node;
    }
  
    // Empty a container (used before re-rendering SVGs)
    function clear(node) {
      while (node.firstChild) node.removeChild(node.firstChild);
    }
  
    // Create a fresh SVG inside a container (and wipe anything that was there before)
    function makeSvg(container, viewBoxW = 1000, viewBoxH = 562, className = "") {
      clear(container);
  
      const svg = el("svg", {
        viewBox: `0 0 ${viewBoxW} ${viewBoxH}`,
        role: "img"
      });
  
      if (className) svg.setAttribute("class", className);
      container.appendChild(svg);
      return svg;
    }
  
    // Keep a number in bounds (stops kitty from leaving the frame)
    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }
  
    // Distance between two points (collision detection)
    function dist(ax, ay, bx, by) {
      return Math.hypot(ax - bx, ay - by);
    }
  
    /* =========================================================
       Reusable SVG sprites (kitty + strawberry)
    ========================================================= */
  
    function drawHelloKittyGroup() {
      const g = el("g", { "data-type": "kitty" });
  
      const img = el("image", {
        href: "assets/hello-kitty-run.png",
        x: -60,
        y: -60,
        width: 120,
        height: 120,
        preserveAspectRatio: "xMidYMid meet"
      });
  
      g.appendChild(img);
      return g;
    }
  
    function drawStrawberryGroup() {
      const g = el("g", { "data-type": "berry" });
  
      const img = el("image", {
        href: "assets/strawberry.png",
        x: -45,
        y: -45,
        width: 150,
        height: 150,
        preserveAspectRatio: "xMidYMid meet"
      });
  
      g.appendChild(img);
      return g;
    }
  
    /* =========================================================
       (1) DATA VISUALIZATION: 16-week marathon training plan
    ========================================================= */
  
    const vizState = {
      units: "km",
      data: [
        { week: "Wk 1", distKm: 24 },
        { week: "Wk 2", distKm: 28 },
        { week: "Wk 3", distKm: 32 },
        { week: "Wk 4", distKm: 26 }, // cutback
        { week: "Wk 5", distKm: 36 },
        { week: "Wk 6", distKm: 40 },
        { week: "Wk 7", distKm: 44 },
        { week: "Wk 8", distKm: 34 }, // cutback
        { week: "Wk 9", distKm: 48 },
        { week: "Wk 10", distKm: 52 },
        { week: "Wk 11", distKm: 56 },
        { week: "Wk 12", distKm: 44 }, // cutback
        { week: "Wk 13", distKm: 58 }, // peak
        { week: "Wk 14", distKm: 46 }, // taper
        { week: "Wk 15", distKm: 34 }, // taper
        { week: "Wk 16", distKm: 20 } // race week
      ]
    };
  
    function kmToMi(km) {
      return km * 0.621371;
    }
  
    // Get the value in the currently selected units
    function getValue(d) {
      return vizState.units === "km" ? d.distKm : kmToMi(d.distKm);
    }
  
    // Format for tooltip text
    function formatValue(v) {
      return vizState.units === "km" ? `${v.toFixed(0)} km` : `${v.toFixed(1)} mi`;
    }
  
    function drawMarathonViz(container) {
      const W = 1000,
        H = 562;
  
      const svg = makeSvg(container, W, H, "viz-svg");
  
      const margin = { top: 70, right: 24, bottom: 76, left: 76 };
      const cw = W - margin.left - margin.right;
      const ch = H - margin.top - margin.bottom;
  
      /* ---- Title + subtitle (sits above chart area) ---- */
      const title = el("text", {
        x: margin.left,
        y: 34,
        fill: "#111",
        "font-size": 22,
        "font-weight": 700
      });
      title.textContent = "16-Week Marathon Training Plan (Weekly Distance)";
      svg.appendChild(title);
  
      const subtitle = el("text", {
        x: margin.left,
        y: 54,
        fill: "rgba(17,17,17,0.65)",
        "font-size": 13
      });
      subtitle.textContent = `Units: ${vizState.units.toUpperCase()} • Hover bars for details`;
      svg.appendChild(subtitle);
  
      /* ---- Main plotting group (everything is positioned relative to margins) ---- */
      const g = el("g", { transform: `translate(${margin.left},${margin.top})` });
      svg.appendChild(g);
  
      const values = vizState.data.map(getValue);
      const maxV = Math.max(...values, 1);
      const padMax = maxV * 1.15; 
  
      /* ---- Grid lines + y-axis tick labels ---- */
      const ticks = 5;
      for (let i = 0; i <= ticks; i++) {
        const t = i / ticks;
        const y = ch - t * ch;
        const v = t * padMax;
  
        g.appendChild(
          el("line", {
            x1: 0,
            y1: y,
            x2: cw,
            y2: y,
            stroke: "rgba(17,17,17,0.10)",
            "stroke-width": 1
          })
        );
  
        const lbl = el("text", {
          x: -12,
          y: y + 4,
          fill: "rgba(17,17,17,0.65)",
          "font-size": 12,
          "text-anchor": "end"
        });
        lbl.textContent = v.toFixed(0);
        g.appendChild(lbl);
      }
  
      /* ---- X-axis baseline ---- */
      g.appendChild(
        el("line", {
          x1: 0,
          y1: ch,
          x2: cw,
          y2: ch,
          stroke: "rgba(17,17,17,0.18)",
          "stroke-width": 1.2
        })
      );
  
      /* ---- Tooltip (shared for all bars) ---- */
      const tip = el("g", { opacity: 0, "pointer-events": "none" });
  
      const tipBg = el("rect", {
        x: 0,
        y: 0,
        rx: 10,
        ry: 10,
        width: 230,
        height: 54,
        fill: "rgba(255,255,255,0.95)",
        stroke: "rgba(17,17,17,0.18)"
      });
  
      const tipT1 = el("text", {
        x: 12,
        y: 22,
        fill: "#111",
        "font-size": 13,
        "font-weight": 700
      });
  
      const tipT2 = el("text", {
        x: 12,
        y: 40,
        fill: "rgba(17,17,17,0.75)",
        "font-size": 12
      });
  
      tip.appendChild(tipBg);
      tip.appendChild(tipT1);
      tip.appendChild(tipT2);
      svg.appendChild(tip);
  
      /* ---- Bars ---- */
      const n = vizState.data.length;
      const gap = 12;
      const barW = (cw - gap * (n - 1)) / n;
  
      vizState.data.forEach((d, i) => {
        const v = getValue(d);
        const h = (v / padMax) * ch;
  
        const x = i * (barW + gap);
        const y = ch - h;
  
        const isCutback = i === 3 || i === 7 || i === 11;
        const isPeak = i === 12;
        const isTaper = i === 13 || i === 14 || i === 15;
  
        // data says Wk 16 is race week, so index 15 is the race bar
        const isRace = i === 15;
  
        const bar = el("rect", {
          x,
          y,
          width: barW,
          height: h,
          rx: 14,
          ry: 14,
          class: "bar"
        });
  
        // CSS classes drive the colors (in style.css)
        if (isCutback) bar.classList.add("bar--cutback");
        if (isPeak) bar.classList.add("bar--peak");
        if (isTaper && !isRace) bar.classList.add("bar--taper");
        if (isRace) bar.classList.add("bar--race");
  
        const barGroup = el("g");
        barGroup.appendChild(bar);
  
        // Tiny kitty stamp on each bar 
        const kittyStamp = el("g", {
          transform: `translate(${x + barW / 2},${y + 14}) scale(0.22)`
        });
        kittyStamp.appendChild(drawHelloKittyGroup());
        barGroup.appendChild(kittyStamp);
  
        // Tooltip interactions
        barGroup.addEventListener("mousemove", (evt) => {
          const pt = svg.createSVGPoint();
          pt.x = evt.clientX;
          pt.y = evt.clientY;
          const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
  
          tip.setAttribute("opacity", "1");
          tipT1.textContent = d.week;
  
          let note = "";
          if (isPeak) note = " - hit your peak!";
          else if (isCutback) note = " - take a breather!";
          else if (isTaper && !isRace) note = " taper";
          else if (isRace) note = " - RACE WEEK :o ";
  
          tipT2.textContent = `Distance: ${formatValue(v)}${note}`;
  
          const tipX = clamp(sp.x + 12, 8, 1000 - 244);
          const tipY = clamp(sp.y - 64, 8, 562 - 62);
          tip.setAttribute("transform", `translate(${tipX},${tipY})`);
        });
  
        barGroup.addEventListener("mouseleave", () => {
          tip.setAttribute("opacity", "0");
        });
  
        g.appendChild(barGroup);
  
        // Week labels along the bottom
        const xlbl = el("text", {
          x: x + barW / 2,
          y: ch + 26,
          fill: "rgba(17,17,17,0.65)",
          "font-size": 12,
          "text-anchor": "middle"
        });
        xlbl.textContent = d.week;
        g.appendChild(xlbl);
      });
  
      /* ---- Y-axis label (rotated) ---- */
      const ylab = el("text", {
        x: 16,
        y: margin.top + ch / 2,
        fill: "rgba(17,17,17,0.65)",
        "font-size": 12,
        transform: `rotate(-90 16 ${margin.top + ch / 2})`,
        "text-anchor": "middle"
      });
      ylab.textContent = vizState.units === "km" ? "Distance (km)" : "Distance (miles)";
      svg.appendChild(ylab);
    }
  
    /* =========================================================
       (2) INTERACTIVE ART: kitty follows mouse + eats strawberries
    ========================================================= */
  
    const artState = {
      paused: false,
      score: 0,
      berries: [],
      mouse: { x: 200, y: 200, inside: false },
  
      // kitty movement state (vx/vy is velocity)
      kitty: { x: 200, y: 200, vx: 0, vy: 0 },
  
      lastSpawn: 0,
      _art: null // references to SVG nodes we need later
    };
  
    function drawArtScene(container) {
      const W = 1000,
        H = 562;
  
      const svg = makeSvg(container, W, H, "art-svg");
  
      // Layers: background, midground (sprites), foreground (HUD)
      const bg = el("g");
      const mid = el("g");
      const fg = el("g");
      svg.appendChild(bg);
      svg.appendChild(mid);
      svg.appendChild(fg);
  
      // Background image (fills the SVG)
      const bgImage = el("image", {
        href: "assets/hello-kitty-bg.png",
        x: 0,
        y: 0,
        width: W,
        height: H,
        preserveAspectRatio: "xMidYMid slice"
      });
      bg.appendChild(bgImage);
  
      // HUD (score box)
      const hud = el("g", { transform: "translate(18,18)" });
      const hudBox = el("rect", {
        x: 0,
        y: 0,
        width: 260,
        height: 76,
        rx: 16,
        ry: 16,
        fill: "rgba(255,255,255,0.95)",
        stroke: "rgba(17,17,17,0.12)"
      });
  
      const hudTitle = el("text", {
        x: 14,
        y: 28,
        fill: "#111",
        "font-size": 14,
        "font-weight": 800
      });
      hudTitle.textContent = "Strawberry Sprint";
  
      const hudScore = el("text", {
        x: 14,
        y: 54,
        fill: "rgba(17,17,17,0.75)",
        "font-size": 13
      });
      hudScore.textContent = "Score: 0";
  
      hud.appendChild(hudBox);
      hud.appendChild(hudTitle);
      hud.appendChild(hudScore);
      fg.appendChild(hud);
  
      // Kitty sprite group (we move this group each frame)
      const kittyG = el("g", {
        transform: `translate(${artState.kitty.x},${artState.kitty.y})`
      });
      kittyG.appendChild(drawHelloKittyGroup());
      mid.appendChild(kittyG);
  
      // Save refs so other functions can update nodes without re-querying the DOM
      artState._art = { svg, W, H, mid, fg, kittyG, hudScore };
  
      /* --- Mouse tracking --- */
      svg.addEventListener("mouseenter", () => (artState.mouse.inside = true));
      svg.addEventListener("mouseleave", () => (artState.mouse.inside = false));
  
      svg.addEventListener("mousemove", (evt) => {
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
        artState.mouse.x = sp.x;
        artState.mouse.y = sp.y;
      });
  
      // Click anywhere in the SVG to spawn a berry
      svg.addEventListener("click", () => spawnBerry());
  
      // Starting berries (so the screen isn’t empty)
      for (let i = 0; i < 4; i++) spawnBerry();
  
      requestAnimationFrame(loop);
    }
  
    function spawnBerry() {
      const a = artState._art;
      if (!a) return;
  
      // Keep berries away from edges so they don’t half-render off screen
      const x = 80 + Math.random() * (a.W - 160);
      const y = 90 + Math.random() * (a.H - 170);
  
      const berryG = el("g", { transform: `translate(${x},${y}) scale(0.42)` });
      berryG.appendChild(drawStrawberryGroup());
  
      // Small bob animation 
      berryG.animate(
        [
          { transform: `translate(${x},${y}) scale(0.42)` },
          { transform: `translate(${x},${y - 6}) scale(0.42)` },
          { transform: `translate(${x},${y}) scale(0.42)` }
        ],
        { duration: 900 + Math.random() * 600, iterations: Infinity }
      );
  
      a.mid.appendChild(berryG);
  
      artState.berries.push({
        x,
        y,
        r: 75, // collision radius (kinda generous so it feels fun)
        node: berryG,
        eaten: false
      });
    }
  
    function eatBerry(b) {
      if (b.eaten) return;
      b.eaten = true;
  
      // Quick “pop” animation then remove from DOM
      const currentTransform = b.node.getAttribute("transform");
      b.node
        .animate(
          [
            { opacity: 1, transform: currentTransform },
            { opacity: 0.1, transform: `${currentTransform} scale(1.6)` }
          ],
          { duration: 220, fill: "forwards" }
        )
        .onfinish = () => {
          if (b.node && b.node.parentNode) b.node.parentNode.removeChild(b.node);
        };
  
      artState.score += 1;
      if (artState._art?.hudScore) {
        artState._art.hudScore.textContent = `Score: ${artState.score}`;
      }
    }
  
    function loop(ts) {
      const a = artState._art;
      if (!a) return;
  
      if (!artState.paused) {
        /* --- Auto-spawn berries (keeps things moving) --- */
        if (ts - artState.lastSpawn > 1200) {
          artState.lastSpawn = ts;
  
          // soft cap so we don’t flood the SVG
          if (artState.berries.filter((b) => !b.eaten).length < 9) spawnBerry();
        }
  
        const k = artState.kitty;
  
        // If mouse leaves the SVG, kitty drifts to a “default” spot
        const targetX = artState.mouse.inside ? artState.mouse.x : a.W * 0.5;
        const targetY = artState.mouse.inside ? artState.mouse.y : a.H * 0.62;
  
        const dx = targetX - k.x;
        const dy = targetY - k.y;
  
        /* --- Smooth steering (basically: ease toward the mouse) --- */
        k.vx = k.vx * 0.82 + dx * 0.02;
        k.vy = k.vy * 0.82 + dy * 0.02;
  
        // Speed limit so kitty doesn’t teleport across the screen
        const maxSpeed = 14;
        const sp = Math.hypot(k.vx, k.vy);
        if (sp > maxSpeed) {
          k.vx = (k.vx / sp) * maxSpeed;
          k.vy = (k.vy / sp) * maxSpeed;
        }
  
        // Apply movement + clamp to the stage
        k.x = clamp(k.x + k.vx, 80, a.W - 80);
        k.y = clamp(k.y + k.vy, 90, a.H - 120);
  
        // Tiny bob so she feels “alive”
        const bob = Math.sin(ts / 120) * 2.6;
        a.kittyG.setAttribute("transform", `translate(${k.x},${k.y + bob})`);
  
        /* --- Collision: if kitty is close enough, eat the berry --- */
        for (const b of artState.berries) {
          if (b.eaten) continue;
          if (dist(k.x, k.y, b.x, b.y) < b.r + 36) eatBerry(b);
        }
  
        /* --- Cleanup: stop the array from growing forever --- */
        if (artState.berries.length > 40) {
          artState.berries = artState.berries.filter((b) => !b.eaten);
        }
      }
  
      requestAnimationFrame(loop);
    }
  
    function resetArt() {
      const a = artState._art;
      if (!a) return;
  
      // Remove existing berries from the SVG
      artState.berries.forEach((b) => {
        if (b.node && b.node.parentNode) b.node.parentNode.removeChild(b.node);
      });
      artState.berries = [];
  
      // Reset score + HUD
      artState.score = 0;
      a.hudScore.textContent = "Score: 0";
  
      // Reset kitty to a comfy default position
      artState.kitty.x = a.W * 0.5;
      artState.kitty.y = a.H * 0.62;
      artState.kitty.vx = 0;
      artState.kitty.vy = 0;
  
      // Spawn some starter berries again
      for (let i = 0; i < 4; i++) spawnBerry();
    }
  
    /* =========================================================
       Public API (main.js calls these)
    ========================================================= */
  
    window.Vis = {
      // chart
      setUnits(units) {
        vizState.units = units === "mi" ? "mi" : "km";
      },
      renderViz() {
        const c = document.getElementById("vizContainer");
        if (c) drawMarathonViz(c);
      },
  
      // art
      renderArt() {
        const c = document.getElementById("artContainer");
        if (c) drawArtScene(c);
      },
      spawnBerry() {
        spawnBerry();
      },
      togglePause() {
        artState.paused = !artState.paused;
        return artState.paused;
      },
      resetArt() {
        resetArt();
      },
      isPaused() {
        return artState.paused;
      }
    };
  })();
  