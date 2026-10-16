/* Placement officer login logic with client-side validation. */
(function () {
  if (auth.isLoggedIn() && auth.getUser().role === "officer") {
    window.location.href = "officer-dashboard.html";
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
    if (!username) { showFieldError("username", "Username is required"); valid = false; }
    if (!password) { showFieldError("password", "Password is required"); valid = false; }
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    try {
      const data = await api.post("/auth/login", { username, password, role: "officer" }, false);
      auth.save(data.token, data.user);
      toast("Welcome, " + data.user.name + "!", "success");
      setTimeout(() => (window.location.href = "officer-dashboard.html"), 600);
    } catch (error) {
      toast(error.message, "error");
      showFieldError("password", error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
})();
