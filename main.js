/* main.js
  - boots up the SVG chart + the Hello Kitty mini-game (if the containers exist)
  - handles UI controls (dropdown + buttons)
  - adds keyboard shortcuts (S / P / R)
*/

(function () {
    "use strict";
  
    window.addEventListener("DOMContentLoaded", () => {
      /* -------------------------------------------------------
        1) Initial render (safe to call even if you're on index.html)
      -------------------------------------------------------- */
      window.Vis?.renderViz();
      window.Vis?.renderArt();
  
      /* -------------------------------------------------------
        2) Chart controls (units dropdown)
      -------------------------------------------------------- */
      const metricSel = document.getElementById("metric");
      metricSel?.addEventListener("change", () => {
        window.Vis?.setUnits(metricSel.value);
        window.Vis?.renderViz();
      });
  
      /* -------------------------------------------------------
        3) Art controls (buttons)
      -------------------------------------------------------- */
      const spawnBtn = document.getElementById("spawnBerry");
      spawnBtn?.addEventListener("click", () => {
        window.Vis?.spawnBerry();
      });
  
      const pauseBtn = document.getElementById("togglePause");
      pauseBtn?.addEventListener("click", () => {
        const paused = window.Vis?.togglePause();
        if (pauseBtn) pauseBtn.textContent = paused ? "Resume" : "Pause";
      });
  
      const resetBtn = document.getElementById("resetGame");
      resetBtn?.addEventListener("click", () => {
        window.Vis?.resetArt();
  
        // If the user reset while paused, keep the pause button label honest
        const paused = window.Vis?.isPaused?.();
        if (pauseBtn) pauseBtn.textContent = paused ? "Resume" : "Pause";
      });
  
      /* -------------------------------------------------------
        4) Keyboard shortcuts (works anywhere on the page)
           S = spawn berry
           P = pause/resume
           R = reset
      -------------------------------------------------------- */
      window.addEventListener("keydown", (e) => {
        const k = e.key.toLowerCase();
  
        if (k === "s") {
          window.Vis?.spawnBerry();
          return;
        }
  
        if (k === "p") {
          const paused = window.Vis?.togglePause();
          if (pauseBtn) pauseBtn.textContent = paused ? "Resume" : "Pause";
          return;
        }
  
        if (k === "r") {
          window.Vis?.resetArt();
        }
      });
  
      /* -------------------------------------------------------
        5) Keep the chart crisp on resize
           (rerendering is easiest because it's SVG anyway)
      -------------------------------------------------------- */
      window.addEventListener("resize", () => {
        window.Vis?.renderViz();
      });
    });
  })();
  