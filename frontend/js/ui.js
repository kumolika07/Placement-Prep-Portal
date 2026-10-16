/* ============================================================
   Shared UI helpers: toast, navbar, formatting, escaping.
   ============================================================ */

/* ---------- Toast notifications ---------- */
function toast(message, type = "info", timeout = 3500) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(40px)";
    el.style.transition = "all 0.25s ease";
    setTimeout(() => el.remove(), 250);
  }, timeout);
}

/* ---------- HTML escaping (prevents XSS when injecting user data) ---------- */
function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---------- Date formatting ---------- */
function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------- Query string helper ---------- */
function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ---------- Navbar renderer ---------- */
function renderNavbar(role) {
  const mount = document.getElementById("navbar");
  if (!mount) return;
  const user = auth.getUser();
  const initial = user && user.name ? user.name.charAt(0).toUpperCase() : "?";

  const studentLinks = `
    <a href="student-dashboard.html" data-nav="student-dashboard.html">Dashboard</a>
    <a href="aptitude.html" data-nav="aptitude.html">Aptitude Tests</a>
    <a href="experiences.html" data-nav="experiences.html">Experiences</a>`;

  const officerLinks = `
    <a href="officer-dashboard.html" data-nav="officer-dashboard.html">Dashboard</a>
    <a href="officer-dashboard.html#students" data-nav="#students">Students</a>
    <a href="officer-dashboard.html#moderation" data-nav="#moderation">Moderation</a>
    <a href="officer-dashboard.html#questions" data-nav="#questions">Questions</a>`;

  const links = role === "officer" ? officerLinks : studentLinks;

  mount.innerHTML = `
    <nav class="navbar">
      <div class="container navbar-inner">
        <a class="brand" href="${role === "officer" ? "officer-dashboard.html" : "student-dashboard.html"}">
          <span class="logo">PP</span>
          <span>PlacementPrep</span>
        </a>
        <div class="nav-links" id="navLinks">${links}</div>
        <div class="nav-user">
          <span class="avatar" title="${esc(user ? user.name : "")}">${initial}</span>
          <button class="btn btn-ghost btn-sm" id="logoutBtn">Logout</button>
          <button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>
        </div>
      </div>
    </nav>`;

  document.getElementById("logoutBtn").addEventListener("click", () => auth.logout());

  const toggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (toggle) {
    toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  // Highlight the current page.
  const current = window.location.pathname.split("/").pop();
  mount.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.getAttribute("data-nav") === current) a.classList.add("active");
  });
}

/* ---------- Simple form validation helper ---------- */
function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + "Error");
  if (input) input.classList.add("is-invalid");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
}

function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + "Error");
  if (input) input.classList.remove("is-invalid");
  if (errorEl) errorEl.classList.remove("show");
}

window.toast = toast;
window.esc = esc;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.qs = qs;
window.renderNavbar = renderNavbar;
window.showFieldError = showFieldError;
window.clearFieldError = clearFieldError;
