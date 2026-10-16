/* Student registration page logic with full client-side validation. */
(function () {
  const form = document.getElementById("registerForm");
  const submitBtn = document.getElementById("submitBtn");
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Pre-fill graduation year with the current year.
  document.getElementById("graduationYear").value = new Date().getFullYear();

  const fields = ["name", "username", "email", "password", "confirmPassword", "branch", "graduationYear", "phone"];
  fields.forEach((id) => {
    document.getElementById(id).addEventListener("input", () => clearFieldError(id));
  });

  const validate = () => {
    let valid = true;
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const branch = document.getElementById("branch").value.trim();
    const graduationYear = parseInt(document.getElementById("graduationYear").value, 10);
    const phone = document.getElementById("phone").value.trim();

    if (name.length < 3) { showFieldError("name", "Name must be at least 3 characters"); valid = false; }
    if (username.length < 4) { showFieldError("username", "Username must be at least 4 characters"); valid = false; }
    if (!EMAIL_REGEX.test(email)) { showFieldError("email", "Enter a valid email address"); valid = false; }
    if (password.length < 6) { showFieldError("password", "Password must be at least 6 characters"); valid = false; }
    if (confirmPassword !== password) { showFieldError("confirmPassword", "Passwords do not match"); valid = false; }
    if (!branch) { showFieldError("branch", "Branch is required"); valid = false; }
    if (!graduationYear || graduationYear < 2020 || graduationYear > 2035) {
      showFieldError("graduationYear", "Enter a valid year (2020-2035)");
      valid = false;
    }
    if (phone && !/^\d{10}$/.test(phone)) { showFieldError("phone", "Phone must be 10 digits"); valid = false; }

    return valid;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast("Please fix the highlighted fields", "error");
      return;
    }

    const payload = {
      name: document.getElementById("name").value.trim(),
      username: document.getElementById("username").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      degree: document.getElementById("degree").value,
      branch: document.getElementById("branch").value.trim(),
      graduationYear: parseInt(document.getElementById("graduationYear").value, 10),
      phone: document.getElementById("phone").value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const data = await api.post("/auth/register", payload, false);
      auth.save(data.token, data.user);
      toast("Account created successfully!", "success");
      setTimeout(() => (window.location.href = "student-dashboard.html"), 700);
    } catch (error) {
      toast(error.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
})();
