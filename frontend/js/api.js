/* ============================================================
   Thin fetch wrapper around the REST API.
   Throws an Error with a readable message on failure.
   ============================================================ */

const api = {
  request: async (path, { method = "GET", body, auth = true } = {}) => {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
      const token = localStorage.getItem("token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${window.API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      throw new Error(
        "Cannot reach the server. Make sure the backend is running at " + window.API_BASE
      );
    }

    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      if (response.status === 401 && auth) {
        // Token expired/invalid -> force re-login.
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw new Error((data && data.message) || `Request failed (${response.status})`);
    }

    return data;
  },

  get: (path, auth = true) => api.request(path, { method: "GET", auth }),
  post: (path, body, auth = true) => api.request(path, { method: "POST", body, auth }),
  put: (path, body, auth = true) => api.request(path, { method: "PUT", body, auth }),
  del: (path, auth = true) => api.request(path, { method: "DELETE", auth }),
};

window.api = api;
