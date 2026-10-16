/* Interview experiences: browse approved, share new, view own submissions. */
(function () {
  const user = auth.guard("student", "student-login.html");
  if (!user) return;
  renderNavbar("student");

  const modal = document.getElementById("shareModal");
  const shareForm = document.getElementById("shareForm");
  document.getElementById("year").value = new Date().getFullYear();

  const difficultyPill = (d) =>
    `<span class="pill pill-${(d || "Medium").toLowerCase()}">${esc(d || "Medium")}</span>`;

  const statusPill = (s) => {
    const cls = s === "approved" ? "pill-approved" : s === "rejected" ? "pill-rejected" : "pill-pending";
    return `<span class="pill ${cls}">${esc(s)}</span>`;
  };

  /* ---------------- Browse ---------------- */
  const loadExperiences = async () => {
    const mount = document.getElementById("experienceList");
    const company = document.getElementById("filterCompany").value.trim();
    const role = document.getElementById("filterRole").value.trim();
    const params = new URLSearchParams();
    if (company) params.set("company", company);
    if (role) params.set("role", role);

    mount.innerHTML = '<div class="spinner"></div>';
    try {
      const data = await api.get("/experiences" + (params.toString() ? "?" + params.toString() : ""));
      if (!data.experiences.length) {
        mount.innerHTML = '<div class="empty"><div class="icon">🔍</div>No experiences found. Try different filters.</div>';
        return;
      }
      mount.innerHTML = data.experiences
        .map((e) => {
          const rounds = (e.rounds || [])
            .map(
              (r) => `<div class="round"><div class="r-name">${esc(r.roundName || "Round")}</div>
                <div class="r-desc">${esc(r.description || "")}</div></div>`
            )
            .join("");
          const author = e.student ? `${esc(e.student.name)} · ${esc(e.student.degree || "")} ${esc(e.student.branch || "")}` : "Anonymous";
          return `
            <div class="exp-card mb-2">
              <div class="exp-top">
                <div>
                  <h3>${esc(e.company)}</h3>
                  <div class="meta">${esc(e.role)} · ${esc(e.jobType)}${e.package ? " · " + esc(e.package) : ""}${e.location ? " · " + esc(e.location) : ""}</div>
                </div>
                <div class="flex gap-1 flex-wrap">
                  ${difficultyPill(e.difficulty)}
                  <span class="pill ${e.selectionStatus === "Selected" ? "pill-selected" : "pill-neutral"}">${esc(e.selectionStatus)}</span>
                </div>
              </div>
              <div class="content">${esc(e.content)}</div>
              ${rounds ? `<div class="rounds">${rounds}</div>` : ""}
              ${e.tips ? `<div class="form-hint mt-2">💡 <strong>Tip:</strong> ${esc(e.tips)}</div>` : ""}
              <div class="form-hint mt-2">Shared by ${author} · ${formatDate(e.createdAt)}</div>
            </div>`;
        })
        .join("");
    } catch (error) {
      mount.innerHTML = `<div class="empty">${esc(error.message)}</div>`;
    }
  };

  /* ---------------- My submissions ---------------- */
  const loadMine = async () => {
    const mount = document.getElementById("mySubmissions");
    try {
      const data = await api.get("/experiences/mine");
      if (!data.experiences.length) {
        mount.innerHTML = '<div class="empty"><div class="icon">📝</div>You have not submitted any experience yet.</div>';
        return;
      }
      mount.innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Submitted</th><th></th></tr></thead>
        <tbody>
        ${data.experiences
          .map(
            (e) => `<tr>
              <td><strong>${esc(e.company)}</strong></td>
              <td>${esc(e.role)}</td>
              <td>${statusPill(e.status)}</td>
              <td>${formatDate(e.createdAt)}</td>
              <td>${
                e.status !== "approved"
                  ? `<button class="btn btn-danger btn-sm" data-del="${e._id}">Delete</button>`
                  : '<span class="text-muted" style="font-size:.8rem">Published</span>'
              }</td>
            </tr>`
          )
          .join("")}
        </tbody></table></div>`;

      mount.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm("Delete this experience?")) return;
          try {
            await api.del("/experiences/" + btn.dataset.del);
            toast("Experience deleted", "success");
            loadMine();
            loadExperiences();
          } catch (error) {
            toast(error.message, "error");
          }
        });
      });
    } catch (error) {
      mount.innerHTML = `<div class="empty">${esc(error.message)}</div>`;
    }
  };

  /* ---------------- Share modal ---------------- */
  const openModal = () => modal.classList.add("show");
  const closeModal = () => {
    modal.classList.remove("show");
    shareForm.reset();
    document.getElementById("year").value = new Date().getFullYear();
  };

  document.getElementById("openShareBtn").addEventListener("click", openModal);
  document.getElementById("closeShareBtn").addEventListener("click", closeModal);
  document.getElementById("cancelShareBtn").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  shareForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const company = document.getElementById("company").value.trim();
    const role = document.getElementById("role").value.trim();
    const content = document.getElementById("content").value.trim();

    let valid = true;
    ["company", "role", "content"].forEach((id) => clearFieldError(id));
    if (!company) { showFieldError("company", "Company is required"); valid = false; }
    if (!role) { showFieldError("role", "Role is required"); valid = false; }
    if (content.length < 20) { showFieldError("content", "Please write at least 20 characters"); valid = false; }
    if (!valid) return;

    const btn = document.getElementById("shareSubmitBtn");
    btn.disabled = true;
    btn.textContent = "Submitting...";

    try {
      await api.post("/experiences", {
        company,
        role,
        jobType: document.getElementById("jobType").value,
        package: document.getElementById("pkg").value.trim(),
        location: document.getElementById("location").value.trim(),
        year: parseInt(document.getElementById("year").value, 10),
        difficulty: document.getElementById("difficulty").value,
        selectionStatus: document.getElementById("selectionStatus").value,
        content,
        tips: document.getElementById("tips").value.trim(),
      });
      toast("Experience submitted for approval!", "success");
      closeModal();
      loadMine();
      loadExperiences();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Submit for Approval";
    }
  });

  document.getElementById("applyFilterBtn").addEventListener("click", loadExperiences);
  document.getElementById("resetFilterBtn").addEventListener("click", () => {
    document.getElementById("filterCompany").value = "";
    document.getElementById("filterRole").value = "";
    loadExperiences();
  });
  ["filterCompany", "filterRole"].forEach((id) =>
    document.getElementById(id).addEventListener("keypress", (e) => {
      if (e.key === "Enter") loadExperiences();
    })
  );

  loadExperiences();
  loadMine();
})();
