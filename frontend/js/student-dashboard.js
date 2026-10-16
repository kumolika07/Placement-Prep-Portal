/* Student dashboard: loads summary, recent results, category performance and experiences. */
(function () {
  const user = auth.guard("student", "student-login.html");
  if (!user) return;

  renderNavbar("student");
  document.getElementById("welcome").textContent = "Welcome back, " + user.name.split(" ")[0] + "!";
  document.getElementById("subtitle").textContent =
    (user.degree || "Postgraduate") + (user.branch ? " · " + user.branch : "") +
    (user.graduationYear ? " · Class of " + user.graduationYear : "");

  const statusPill = (status) => {
    const cls = status === "approved" ? "pill-approved" : status === "rejected" ? "pill-rejected" : "pill-pending";
    return `<span class="pill ${cls}">${esc(status)}</span>`;
  };

  const load = async () => {
    try {
      const data = await api.get("/students/dashboard");
      const s = data.summary;

      document.getElementById("statTests").textContent = s.totalTests;
      document.getElementById("statAvg").textContent = s.avgScore + "%";
      document.getElementById("statBest").textContent = s.bestScore + "%";
      document.getElementById("statExp").textContent = s.totalExperiences;

      // Recent results
      const rr = document.getElementById("recentResults");
      if (!data.recentResults.length) {
        rr.innerHTML = '<div class="empty"><div class="icon">📭</div>No tests attempted yet. <a href="aptitude.html">Take your first test</a>.</div>';
      } else {
        rr.innerHTML = data.recentResults
          .map(
            (r) => `
          <div class="flex justify-between items-center" style="padding:10px 0;border-bottom:1px solid var(--line)">
            <div>
              <div style="font-weight:600">${esc(r.category)}</div>
              <div class="text-muted" style="font-size:.8rem">${formatDate(r.createdAt)} · ${r.correctAnswers}/${r.totalQuestions} correct</div>
            </div>
            <span class="pill ${r.scorePercent >= 60 ? "pill-approved" : r.scorePercent >= 40 ? "pill-pending" : "pill-rejected"}">${r.scorePercent}%</span>
          </div>`
          )
          .join("");
      }

      // Category performance
      const cp = document.getElementById("categoryPerformance");
      const cats = Object.keys(s.byCategory);
      if (!cats.length) {
        cp.innerHTML = '<div class="empty"><div class="icon">📊</div>No performance data yet.</div>';
      } else {
        cp.innerHTML = cats
          .map(
            (cat) => `
          <div style="margin-bottom:14px">
            <div class="flex justify-between" style="font-size:.86rem;margin-bottom:5px">
              <span>${esc(cat)}</span><strong>${s.byCategory[cat]}%</strong>
            </div>
            <div class="progress"><span style="width:${s.byCategory[cat]}%"></span></div>
          </div>`
          )
          .join("");
      }

      loadExperiences();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const loadExperiences = async () => {
    const mount = document.getElementById("myExperiences");
    try {
      const data = await api.get("/experiences/mine");
      if (!data.experiences.length) {
        mount.innerHTML =
          '<div class="empty"><div class="icon">📝</div>You have not shared any experience yet. ' +
          '<a href="experiences.html">Share one now</a>.</div>';
        return;
      }
      mount.innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Company</th><th>Role</th><th>Type</th><th>Status</th><th>Submitted</th></tr></thead>
        <tbody>
        ${data.experiences
          .map(
            (e) => `<tr>
              <td><strong>${esc(e.company)}</strong></td>
              <td>${esc(e.role)}</td>
              <td>${esc(e.jobType)}</td>
              <td>${statusPill(e.status)}</td>
              <td>${formatDate(e.createdAt)}</td>
            </tr>`
          )
          .join("")}
        </tbody></table></div>`;
    } catch (error) {
      mount.innerHTML = `<div class="empty">${esc(error.message)}</div>`;
    }
  };

  load();
})();
