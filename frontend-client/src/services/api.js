const BASE_URL = "http://localhost:5000";

/* =========================
   AUTH APIs (ADD THESE)
========================= */

// SIGN UP
export const signupUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  return res.json();
};

// LOGIN
export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  return res.json();
};

/* =========================
   TV PAIRING APIs (KEEP)
========================= */

export const pairDisplay = async (code) => {
  const res = await fetch(`${BASE_URL}/api/display/pair`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code })
  });

  if (!res.ok) {
    throw new Error("Invalid code");
  }

  return res.json();
};

/* =========================
   MEDIA APIs (KEEP)
========================= */

export const uploadMedia = async (file, displayId, type) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("displayId", displayId);
  formData.append("type", type);

  const res = await fetch(`${BASE_URL}/api/media/upload`, {
    method: "POST",
    body: formData
  });

  return res.json();
};

export const getPlayers = async (userId) => {
  const res = await fetch(
    `http://localhost:5000/api/display/players?userId=${userId}`
  );
  return res.json();
};
export const registerPlayer = async (data) => {
  const res = await fetch(`${BASE_URL}/api/display/register-player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};
export const unregisterPlayer = async (id) => {
  const res = await fetch(
    `http://localhost:5000/api/display/unregister/${id}`,
    {
      method: "DELETE"
    }
  );

  return res.json();
};