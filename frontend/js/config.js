
/* API configuration */
(function () {
  const override = localStorage.getItem("apiBase");
  let base;

  if (override) {
    base = override;
  } else if (
    location.hostname !== "localhost" &&
    location.hostname !== "127.0.0.1"
  ) {
    // Hosted website: frontend and backend use the same domain
    base = "/api";
  } else if (
    location.protocol.startsWith("http") &&
    location.port === "5000"
  ) {
    base = "/api";
  } else {
    // Local development
    base = "http://localhost:5000/api";
  }

  window.API_BASE = base;
  console.log("[config] API base ->", window.API_BASE);
})();
