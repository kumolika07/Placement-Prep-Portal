/* ============================================================
   API configuration
   ------------------------------------------------------------
   Builds a list of candidate API base URLs. api.js then picks the
   first one that answers a /health request, so the same code works:

   1. Deployed (Render / any host)  -> same origin  e.g. https://your-app.onrender.com/api
   2. Live Server on :5500          -> http://localhost:5000/api
   3. Opened as a local file        -> http://localhost:5000/api

   Override anytime:
      localStorage.setItem("apiBase", "https://your-api.example.com/api")
   ============================================================ */
(function () {
  const override = localStorage.getItem("apiBase");
  const candidates = [];

  if (override) {
    candidates.push(override.replace(/\/+$/, ""));
  } else {
    if (location.protocol === "http:" || location.protocol === "https:") {
      candidates.push(location.origin.replace(/\/+$/, "") + "/api");
    }
    candidates.push("http://localhost:5000/api");
  }

  window.API_CANDIDATES = candidates;
  window.API_BASE = candidates[0];
  console.log("[config] API candidates ->", candidates.join(" , "));
})();
