/* Placement officer dashboard: stats, students, moderation, question bank. */
(function () {
  const user = auth.guard("officer", "officer-login.html");
  if (!user) return;
  renderNavbar("officer");

  document.getElementById("welcome").textContent = "Welcome, " + user.name;

  const esc2 = esc;

  /* ================= Dashboard stats ================= */
  const loadDashboard = async () => {
    try {
      const data = await api.get("/officer/dashboard");
      const s = data.stats;
      document.getElementById("statStudents").textContent = s.totalStudents;
      document.getElementById("statTests").textContent = s.totalTests;
      document.getElementById("statAvg").textContent = s.averageScore + "%";
      document.getElementById("statPending").textContent = s.pendingExperiences;
      document.getElementById("statQuestions").textContent = s.totalQuestions;
      document.getElementById("statApproved").textContent = s.approvedExperiences;

      const tp = document.getElementById("topPerformers");
      if (!data.topPerformers.length) {
        tp.innerHTML = '<div class="empty"><div class="icon">🏆</div>No test data yet.</div>';
      } else {
        const medals = ["🥇", "🥈", "🥉"];
        tp.innerHTML = data.topPerformers
          .map(
            (p, i) => `
          <div class="flex justify-between items-center" style="padding:9px 0;border-bottom:1px solid var(--line)">
            <div class="flex items-center gap-1">
              <span>${medals[i] || "•"}</span>
              <div>
                <div style="font-weight:600">${esc2(p.name)}</div>
                <div class="text-muted" style="font-size:.78rem">${esc2(p.branch || "N/A")} · ${p.tests} test(s)</div>
              </div>
            </div>
            <span class="pill pill-approved">${p.avgScore}%</span>
          </div>`
          )
          .join("");
      }
    } catch (error) {
      toast(error.message, "error");
    }
  };

  /* ================= Students ================= */
  const loadStudents = async () => {
    const mount = document.getElementById("studentsTable");
    try {
      const data = await api.get("/officer/students");
      if (!data.students.length) {
        mount.innerHTML = '<div class="empty">No students registered yet.</div>';
        return;
      }
      mount.innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Name</th><th>Branch</th><th>Tests</th><th>Avg</th><th>Best</th><th>Experiences</th><th></th></tr></thead>
        <tbody>
        ${data.students
          .map(
            (s) => `<tr>
              <td><strong>${esc2(s.name)}</strong><div class="text-muted" style="font-size:.76rem">@${esc2(s.username)}</div></td>
              <td>${esc2(s.degree || "")}<div class="text-muted" style="font-size:.76rem">${esc2(s.branch || "N/A")}</div></td>
              <td>${s.tests}</td>
              <td><span class="pill ${s.avgScore >= 60 ? "pill-approved" : s.avgScore >= 40 ? "pill-pending" : "pill-rejected"}">${s.avgScore}%</span></td>
              <td>${s.bestScore}%</td>
              <td>${s.experiences}</td>
              <td><button class="btn btn-sm btn-outline" data-view="${s._id}">View</button></td>
            </tr>`
          )
          .join("")}
        </tbody></table></div>`;

      mount.querySelectorAll("[data-view]").forEach((btn) =>
        btn.addEventListener("click", () => openStudent(btn.dataset.view))
      );
    } catch (error) {
      mount.innerHTML = `<div class="empty">${esc2(error.message)}</div>`;
    }
  };

  const openStudent = async (id) => {
    const modal = document.getElementById("studentModal");
    const title = document.getElementById("studentModalTitle");
    const body = document.getElementById("studentModalBody");
    body.innerHTML = '<div class="spinner"></div>';
    modal.classList.add("show");

    try {
      const data = await api.get("/officer/students/" + id);
      const s = data.student;
      title.textContent = s.name;
      const results = data.results
        .map(
          (r) => `<tr><td>${esc2(r.category)}</td><td><span class="pill ${r.scorePercent >= 60 ? "pill-approved" : "pill-pending"}">${r.scorePercent}%</span></td>
            <td>${r.correctAnswers}/${r.totalQuestions}</td><td>${formatDate(r.createdAt)}</td></tr>`
        )
        .join("");
      const exps = data.experiences
        .map(
          (e) => `<tr><td>${esc2(e.company)}</td><td>${esc2(e.role)}</td>
            <td><span class="pill ${e.status === "approved" ? "pill-approved" : e.status === "rejected" ? "pill-rejected" : "pill-pending"}">${esc2(e.status)}</span></td></tr>`
        )
        .join("");

      body.innerHTML = `
        <div class="grid grid-3 mb-2">
          <div class="stat"><div class="label">Degree</div><div class="value" style="font-size:1.1rem">${esc2(s.degree || "-")}</div></div>
          <div class="stat"><div class="label">Branch</div><div class="value" style="font-size:1.1rem">${esc2(s.branch || "-")}</div></div>
          <div class="stat"><div class="label">Year</div><div class="value" style="font-size:1.1rem">${esc2(s.graduationYear || "-")}</div></div>
        </div>
        <div class="form-hint mb-2">Email: ${esc2(s.email)}${s.phone ? " · Phone: " + esc2(s.phone) : ""}</div>
        <h4 class="mb-1">Test Results</h4>
        ${results ? `<div class="table-wrap mb-2"><table><thead><tr><th>Category</th><th>Score</th><th>Correct</th><th>Date</th></tr></thead><tbody>${results}</tbody></table></div>` : '<p class="text-muted mb-2">No tests attempted.</p>'}
        <h4 class="mb-1">Experiences</h4>
        ${exps ? `<div class="table-wrap"><table><thead><tr><th>Company</th><th>Role</th><th>Status</th></tr></thead><tbody>${exps}</tbody></table></div>` : '<p class="text-muted">No experiences shared.</p>'}`;
    } catch (error) {
      body.innerHTML = `<div class="empty">${esc2(error.message)}</div>`;
    }
  };

  /* ================= Moderation ================= */
  const loadModeration = async () => {
    const mount = document.getElementById("moderationList");
    const status = document.getElementById("moderationFilter").value;
    mount.innerHTML = '<div class="spinner"></div>';
    try {
      const data = await api.get("/officer/experiences" + (status ? "?status=" + status : ""));
      if (!data.experiences.length) {
        mount.innerHTML = '<div class="empty"><div class="icon">✅</div>No experiences in this category.</div>';
        return;
      }
      mount.innerHTML = data.experiences
        .map((e) => {
          const author = e.student ? `${esc2(e.student.name)} (${esc2(e.student.username)})` : "Unknown";
          return `
          <div class="exp-card mb-2">
            <div class="exp-top">
              <div>
                <h3>${esc2(e.company)} — ${esc2(e.role)}</h3>
                <div class="meta">By ${author} · ${esc2(e.jobType)} · ${formatDate(e.createdAt)}</div>
              </div>
              <span class="pill ${e.status === "approved" ? "pill-approved" : e.status === "rejected" ? "pill-rejected" : "pill-pending"}">${esc2(e.status)}</span>
            </div>
            <div class="content">${esc2(e.content)}</div>
            ${e.tips ? `<div class="form-hint mt-2">💡 ${esc2(e.tips)}</div>` : ""}
            <div class="flex gap-1 mt-2 flex-wrap">
              ${e.status !== "approved" ? `<button class="btn btn-success btn-sm" data-approve="${e._id}">Approve</button>` : ""}
              ${e.status !== "rejected" ? `<button class="btn btn-danger btn-sm" data-reject="${e._id}">Reject</button>` : ""}
              ${e.status !== "pending" ? `<button class="btn btn-ghost btn-sm" data-pending="${e._id}">Set Pending</button>` : ""}
            </div>
          </div>`;
        })
        .join("");

      const moderate = async (id, newStatus) => {
        try {
          await api.put(`/officer/experiences/${id}/status`, { status: newStatus });
          toast("Experience " + newStatus, "success");
          loadModeration();
          loadDashboard();
        } catch (error) {
          toast(error.message, "error");
        }
      };
      mount.querySelectorAll("[data-approve]").forEach((b) => b.addEventListener("click", () => moderate(b.dataset.approve, "approved")));
      mount.querySelectorAll("[data-reject]").forEach((b) => b.addEventListener("click", () => moderate(b.dataset.reject, "rejected")));
      mount.querySelectorAll("[data-pending]").forEach((b) => b.addEventListener("click", () => moderate(b.dataset.pending, "pending")));
    } catch (error) {
      mount.innerHTML = `<div class="empty">${esc2(error.message)}</div>`;
    }
  };

  /* ================= Questions ================= */
  const loadQuestions = async () => {
    const mount = document.getElementById("questionsList");
    const category = document.getElementById("questionCategoryFilter").value;
    mount.innerHTML = '<div class="spinner"></div>';
    try {
      const data = await api.get("/officer/questions" + (category ? "?category=" + encodeURIComponent(category) : ""));
      if (!data.questions.length) {
        mount.innerHTML = '<div class="empty">No questions found. Add one to get started.</div>';
        return;
      }
      const letters = ["A", "B", "C", "D"];
      mount.innerHTML = data.questions
        .map(
          (q) => `
        <div class="question-block" style="padding:16px">
          <div class="flex justify-between items-start gap-1">
            <div>
              <span class="pill pill-info">${esc2(q.category)}</span>
              <span class="pill pill-${q.difficulty.toLowerCase()}">${esc2(q.difficulty)}</span>
            </div>
            <button class="btn btn-danger btn-sm" data-delq="${q._id}">Delete</button>
          </div>
          <div class="q-text" style="font-size:.98rem;margin:10px 0 8px">${esc2(q.questionText)}</div>
          <div style="font-size:.86rem">
            ${q.options.map((o, i) => `<div style="padding:2px 0;${i === q.correctOption ? "color:var(--success);font-weight:600" : "color:var(--muted)"}">${letters[i]}. ${esc2(o)} ${i === q.correctOption ? "✓" : ""}</div>`).join("")}
          </div>
        </div>`
        )
        .join("");

      mount.querySelectorAll("[data-delq]").forEach((b) =>
        b.addEventListener("click", async () => {
          if (!confirm("Delete this question?")) return;
          try {
            await api.del("/officer/questions/" + b.dataset.delq);
            toast("Question deleted", "success");
            loadQuestions();
            loadDashboard();
          } catch (error) {
            toast(error.message, "error");
          }
        })
      );
    } catch (error) {
      mount.innerHTML = `<div class="empty">${esc2(error.message)}</div>`;
    }
  };

  /* ================= Modal controls ================= */
  const studentModal = document.getElementById("studentModal");
  const questionModal = document.getElementById("questionModal");
  document.getElementById("closeStudentBtn").addEventListener("click", () => studentModal.classList.remove("show"));
  studentModal.addEventListener("click", (e) => { if (e.target === studentModal) studentModal.classList.remove("show"); });

  const openQuestionModal = () => questionModal.classList.add("show");
  const closeQuestionModal = () => { questionModal.classList.remove("show"); document.getElementById("questionForm").reset(); };
  document.getElementById("openQuestionBtn").addEventListener("click", openQuestionModal);
  document.getElementById("closeQuestionBtn").addEventListener("click", closeQuestionModal);
  document.getElementById("cancelQuestionBtn").addEventListener("click", closeQuestionModal);
  questionModal.addEventListener("click", (e) => { if (e.target === questionModal) closeQuestionModal(); });

  document.getElementById("questionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const qText = document.getElementById("qText").value.trim();
    const options = [0, 1, 2, 3].map((i) => document.getElementById("qOption" + i).value.trim());

    clearFieldError("qText");
    if (qText.length < 5) {
      showFieldError("qText", "Question text is required");
      return;
    }
    if (options.some((o) => !o)) {
      toast("All four options are required", "error");
      return;
    }

    const btn = document.getElementById("questionSubmitBtn");
    btn.disabled = true;
    btn.textContent = "Adding...";
    try {
      await api.post("/officer/questions", {
        category: document.getElementById("qCategory").value,
        questionText: qText,
        options,
        correctOption: parseInt(document.getElementById("qCorrect").value, 10),
        difficulty: document.getElementById("qDifficulty").value,
        explanation: document.getElementById("qExplanation").value.trim(),
      });
      toast("Question added!", "success");
      closeQuestionModal();
      loadQuestions();
      loadDashboard();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Add Question";
    }
  });

  /* ================= Events ================= */
  document.getElementById("refreshBtn").addEventListener("click", () => {
    loadDashboard();
    loadStudents();
    loadModeration();
    loadQuestions();
    toast("Data refreshed", "info");
  });
  document.getElementById("moderationFilter").addEventListener("change", loadModeration);
  document.getElementById("questionCategoryFilter").addEventListener("change", loadQuestions);

  /* ================= Boot ================= */
  loadDashboard();
  loadStudents();
  loadModeration();
  loadQuestions();
})();
