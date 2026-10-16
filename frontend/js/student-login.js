/* Student login page logic with client-side form validation. */
(function () {
  // Already logged in as student? Skip the form.
  if (auth.isLoggedIn() && auth.getUser().role === "student") {
    window.location.href = "student-dashboard.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");

  ["username", "password"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => clearFieldError(id));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    let valid = true;
    if (!username) {
      showFieldError("username", "Username is required");
      valid = false;
    } else if (username.length < 4) {
      showFieldError("username", "Username must be at least 4 characters");
      valid = false;
    }
    if (!password) {
      showFieldError("password", "Password is required");
      valid = false;
    } else if (password.length < 6) {
      showFieldError("password", "Password must be at least 6 characters");
      valid = false;
    }
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    try {
      const data = await api.post("/auth/login", { username, password, role: "student" }, false);
      auth.save(data.token, data.user);
      toast("Welcome back, " + data.user.name + "!", "success");
      setTimeout(() => (window.location.href = "student-dashboard.html"), 600);
    } catch (error) {
      toast(error.message, "error");
      showFieldError("password", error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
})();
