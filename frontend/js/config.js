/* ============================================================
   API configuration
   ------------------------------------------------------------
   Works in three modes without edits:
   1. Served by the backend itself (http://localhost:5000)  -> /api
   2. Served by Live Server / another port (e.g. :5500)      -> http://localhost:5000/api
   3. Opened as a local file                                 -> http://localhost:5000/api
   Override anytime by setting localStorage.setItem("apiBase", "https://your-api/api")
   ============================================================ */
(function () {
  const override = localStorage.getItem("apiBase");
  let base;

  if (override) {
    base = override;
  } else if (location.protocol.startsWith("http") && location.port === "5000") {
    base = "/api";
  } else {
    base = "http://localhost:5000/api";
  }

  window.API_BASE = base;
  console.log("[config] API base ->", window.API_BASE);
})();
