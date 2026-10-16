/* Aptitude page: list categories, start a test, show history. */
(function () {
  const user = auth.guard("student", "student-login.html");
  if (!user) return;
  renderNavbar("student");

  const icons = {
    Quantitative: "🔢",
    "Logical Reasoning": "🧠",
    "Verbal Ability": "📚",
    Technical: "💻",
  };

  const loadCategories = async () => {
    const grid = document.getElementById("categoryGrid");
    try {
      const data = await api.get("/aptitude/categories");
      grid.innerHTML = data.categories
        .map(
          (c) => `
        <div class="category-card" data-category="${esc(c.name)}">
          <div class="cc-icon">${icons[c.name] || "📝"}</div>
          <h4>${esc(c.name)}</h4>
          <p>${c.count} question${c.count === 1 ? "" : "s"} available</p>
          <button class="btn btn-sm btn-block mt-2" ${c.count === 0 ? "disabled" : ""}>
            ${c.count === 0 ? "Not available" : "Start Test"}
          </button>
        </div>`
        )
        .join("");

      grid.querySelectorAll(".category-card").forEach((card) => {
        const btn = card.querySelector("button");
        if (btn.disabled) return;
        card.addEventListener("click", () => startTest(card.dataset.category));
      });
    } catch (error) {
      grid.innerHTML = `<div class="empty">${esc(error.message)}</div>`;
    }
  };

  const startTest = (category) => {
    const limit = document.getElementById("testLength").value;
    const difficulty = document.getElementById("difficulty").value;
    const params = new URLSearchParams({ category, limit });
    if (difficulty) params.set("difficulty", difficulty);
    window.location.href = "test.html?" + params.toString();
  };

  const loadHistory = async () => {
    const mount = document.getElementById("history");
    try {
      const data = await api.get("/aptitude/results");
      if (!data.results.length) {
        mount.innerHTML = '<div class="empty"><div class="icon">📭</div>No attempts yet. Start a test above!</div>';
        return;
      }
      mount.innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Category</th><th>Score</th><th>Correct</th><th>Time</th><th>Date</th></tr></thead>
        <tbody>
        ${data.results
          .map((r) => {
            const cls = r.scorePercent >= 60 ? "pill-approved" : r.scorePercent >= 40 ? "pill-pending" : "pill-rejected";
            const mins = Math.floor(r.timeTakenSeconds / 60);
            const secs = r.timeTakenSeconds % 60;
            return `<tr>
              <td><strong>${esc(r.category)}</strong></td>
              <td><span class="pill ${cls}">${r.scorePercent}%</span></td>
              <td>${r.correctAnswers}/${r.totalQuestions}</td>
              <td>${mins}m ${secs}s</td>
              <td>${formatDateTime(r.createdAt)}</td>
            </tr>`;
          })
          .join("")}
        </tbody></table></div>`;
    } catch (error) {
      mount.innerHTML = `<div class="empty">${esc(error.message)}</div>`;
    }
  };

  loadCategories();
  loadHistory();
})();
