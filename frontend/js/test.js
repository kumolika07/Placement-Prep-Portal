/* Timed aptitude test: fetch questions, collect answers, submit, show review. */
(function () {
  const user = auth.guard("student", "student-login.html");
  if (!user) return;
  renderNavbar("student");

  const category = qs("category");
  const limit = qs("limit") || "10";
  const difficulty = qs("difficulty") || "";

  if (!category) {
    document.getElementById("loading").innerHTML =
      '<div class="empty"><div class="icon">⚠️</div>No category selected. <a href="aptitude.html">Go back</a>.</div>';
    return;
  }

  const state = {
    questions: [],
    answers: {}, // questionId -> selectedOption
    durationSeconds: 600,
    remaining: 600,
    timerId: null,
    startedAt: Date.now(),
    submitted: false,
  };

  const els = {
    loading: document.getElementById("loading"),
    testState: document.getElementById("testState"),
    resultState: document.getElementById("resultState"),
    title: document.getElementById("testTitle"),
    meta: document.getElementById("testMeta"),
    timer: document.getElementById("timer"),
    progressBar: document.getElementById("progressBar"),
    answeredCount: document.getElementById("answeredCount"),
    container: document.getElementById("questionsContainer"),
    submitBtn: document.getElementById("submitBtn"),
    banner: document.getElementById("resultBanner"),
    review: document.getElementById("reviewContainer"),
  };

  /* ---------------- Load questions ---------------- */
  const load = async () => {
    try {
      const params = new URLSearchParams({ category, limit });
      if (difficulty) params.set("difficulty", difficulty);
      const data = await api.get("/aptitude/questions?" + params.toString());

      state.questions = data.questions;
      state.durationSeconds = data.durationSeconds || data.questions.length * 60;
      state.remaining = state.durationSeconds;

      els.title.textContent = category + " Test";
      els.meta.textContent =
        data.questions.length + " questions" + (difficulty ? " · " + difficulty : " · Mixed difficulty");

      renderQuestions();
      els.loading.classList.add("hidden");
      els.testState.classList.remove("hidden");
      startTimer();
    } catch (error) {
      els.loading.innerHTML =
        '<div class="empty"><div class="icon">⚠️</div>' + esc(error.message) +
        '<div class="mt-2"><a class="btn btn-outline btn-sm" href="aptitude.html">Back to Tests</a></div></div>';
    }
  };

  /* ---------------- Render questions ---------------- */
  const renderQuestions = () => {
    els.container.innerHTML = state.questions
      .map((q, idx) => {
        const letters = ["A", "B", "C", "D"];
        const options = q.options
          .map(
            (opt, oIdx) => `
            <label class="option" data-qid="${q._id}" data-opt="${oIdx}">
              <input type="radio" name="q_${q._id}" value="${oIdx}" />
              <span><strong>${letters[oIdx]}.</strong> ${esc(opt)}</span>
            </label>`
          )
          .join("");
        return `
          <div class="question-block" id="block_${q._id}">
            <div class="q-no">Question ${idx + 1} of ${state.questions.length}</div>
            <div class="q-text">${esc(q.questionText)}</div>
            ${options}
          </div>`;
      })
      .join("");

    // Wire up option selection.
    els.container.querySelectorAll(".option").forEach((label) => {
      label.addEventListener("click", () => {
        const qid = label.dataset.qid;
        const opt = parseInt(label.dataset.opt, 10);
        state.answers[qid] = opt;

        // Update visual selection within this question.
        els.container
          .querySelectorAll(`.option[data-qid="${qid}"]`)
          .forEach((o) => o.classList.remove("selected"));
        label.classList.add("selected");
        updateProgress();
      });
    });
  };

  const updateProgress = () => {
    const answered = Object.keys(state.answers).length;
    const total = state.questions.length;
    els.answeredCount.textContent = `${answered} of ${total} answered`;
    els.progressBar.style.width = (answered / total) * 100 + "%";
  };

  /* ---------------- Timer ---------------- */
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTimer = () => {
    els.timer.textContent = formatTime(state.remaining);
    state.timerId = setInterval(() => {
      state.remaining -= 1;
      els.timer.textContent = formatTime(state.remaining);
      if (state.remaining <= 60) els.timer.classList.add("low");
      if (state.remaining <= 0) {
        clearInterval(state.timerId);
        toast("Time is up! Submitting your test.", "warning");
        submit(true);
      }
    }, 1000);
  };

  /* ---------------- Submit ---------------- */
  const submit = async (autoSubmit = false) => {
    if (state.submitted) return;
    const answered = Object.keys(state.answers).length;

    if (!autoSubmit && answered < state.questions.length) {
      const ok = confirm(
        `You have answered ${answered} of ${state.questions.length} questions. Submit anyway?`
      );
      if (!ok) return;
    }

    state.submitted = true;
    clearInterval(state.timerId);
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = "Submitting...";

    const answers = state.questions.map((q) => ({
      questionId: q._id,
      selectedOption: state.answers[q._id] !== undefined ? state.answers[q._id] : null,
    }));

    const timeTakenSeconds = Math.min(
      state.durationSeconds,
      Math.round((Date.now() - state.startedAt) / 1000)
    );

    try {
      const data = await api.post("/aptitude/submit", {
        category,
        answers,
        timeTakenSeconds,
      });
      showResult(data.result, data.review);
    } catch (error) {
      state.submitted = false;
      els.submitBtn.disabled = false;
      els.submitBtn.textContent = "Submit Test";
      toast(error.message, "error");
    }
  };

  const showResult = (result, review) => {
    els.testState.classList.add("hidden");
    els.resultState.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const pass = result.scorePercent >= 60;
    els.banner.className = "result-banner " + (pass ? "pass" : "fail");
    els.banner.innerHTML = `
      <div class="big">${result.scorePercent}%</div>
      <p class="mt-1"><strong>${result.correctAnswers}</strong> correct out of <strong>${result.totalQuestions}</strong></p>
      <p class="text-muted">${pass ? "Great job! Keep it up." : "Keep practising, you can improve."}</p>`;

    const letters = ["A", "B", "C", "D"];
    els.review.innerHTML = review
      .map((r, idx) => {
        const options = r.options
          .map((opt, oIdx) => {
            let cls = "option";
            if (oIdx === r.correctOption) cls += " correct";
            else if (oIdx === r.selectedOption) cls += " wrong";
            return `<div class="${cls}"><span><strong>${letters[oIdx]}.</strong> ${esc(opt)}</span></div>`;
          })
          .join("");
        const status = r.isCorrect
          ? '<span class="pill pill-approved">Correct</span>'
          : r.selectedOption === null
          ? '<span class="pill pill-neutral">Not answered</span>'
          : '<span class="pill pill-rejected">Wrong</span>';
        return `
          <div class="question-block">
            <div class="flex justify-between items-center">
              <div class="q-no">Question ${idx + 1}</div>
              ${status}
            </div>
            <div class="q-text">${esc(r.questionText)}</div>
            ${options}
            ${r.explanation ? `<div class="form-hint mt-1">💡 ${esc(r.explanation)}</div>` : ""}
          </div>`;
      })
      .join("");
  };

  els.submitBtn.addEventListener("click", () => submit(false));
  load();
})();
