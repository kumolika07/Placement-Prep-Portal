/* ============================================================
   Thin fetch wrapper around the REST API.
   Throws an Error with a readable message on failure.

   The API base URL is resolved automatically: the first candidate
   that answers /health wins. This makes the frontend work on a
   deployed host (Render), on Live Server, and from a local file.
   ============================================================ */

const ping = async (base) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${base}/health`, { signal: controller.signal });
    return res.ok;
  } catch (e) {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

let resolvedBase = null;

const resolveBase = async () => {
  if (resolvedBase) return resolvedBase;
  const candidates = window.API_CANDIDATES || [window.API_BASE];

  for (const candidate of candidates) {
    if (await ping(candidate)) {
      resolvedBase = candidate;
      window.API_BASE = candidate;
      console.log("[api] using base ->", candidate);
      return resolvedBase;
    }
  }

  // Nothing answered - keep the first candidate so the error message is clear.
  resolvedBase = candidates[0];
  window.API_BASE = resolvedBase;
  return resolvedBase;
};

const api = {
  request: async (path, { method = "GET", body, auth = true } = {}) => {
    const base = await resolveBase();
    const headers = { "Content-Type": "application/json" };

    if (auth) {
      const token = localStorage.getItem("token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${base}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      throw new Error("Cannot reach the server at " + base + ". Please try again.");
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
