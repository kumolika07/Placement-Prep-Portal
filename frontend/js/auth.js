/* ============================================================
   Session helpers: store token + user, guards, logout.
   ============================================================ */

const auth = {
  save(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getToken() && !!this.getUser();
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  },

  /**
   * Protect a page. Redirects to `loginPage` when not logged in or role mismatch.
   * @returns the user object when allowed.
   */
  guard(role, loginPage) {
    const user = this.getUser();
    if (!this.getToken() || !user) {
      window.location.href = loginPage || "index.html";
      return null;
    }
    if (role && user.role !== role) {
      window.location.href = loginPage || "index.html";
      return null;
    }
    return user;
  },
};

window.auth = auth;
