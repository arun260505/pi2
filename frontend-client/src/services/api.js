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
    `${BASE_URL}/api/display/players?userId=${userId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch players");
  }

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
// 🔹 GET ASSETS (per user)
export const getAssets = async (userId) => {
  const res = await fetch(
    `http://localhost:5000/api/assets?userId=${userId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch assets");
  }

  return res.json();
};

// 🔹 UPLOAD ASSET
export const uploadAsset = async (file, userId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);

  const res = await fetch("http://localhost:5000/api/assets/upload", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error("Failed to upload asset");
  }

  return res.json();
};
export const deleteAsset = async (id) => {
  const res = await fetch(`http://localhost:5000/api/assets/${id}`, {
    method: "DELETE"
  });
  return res.json();
};

/* =========================
   PLAYLIST APIs (ADD)
========================= */

// GET PLAYLISTS BY USER
export const getPlaylists = async (userId) => {
  const res = await fetch(
    `${BASE_URL}/api/playlists?userId=${userId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch playlists");
  }

  return res.json();
};


// CREATE PLAYLIST
export const createPlaylist = async (name, userId) => {
  const res = await fetch(`${BASE_URL}/api/playlists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, userId })
  });

  return res.json();
};

// GET ASSETS IN PLAYLIST
export const getPlaylistAssets = async (playlistId) => {
  const res = await fetch(
    `${BASE_URL}/api/playlists/${playlistId}/assets`
  );
  return res.json();
};

// ADD ASSETS TO PLAYLIST
export const addAssetsToPlaylist = async (playlistId, assetIds) => {
  const res = await fetch(
    `${BASE_URL}/api/playlists/${playlistId}/assets`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ assetIds })
    }
  );

  return res.json();
};

// REMOVE ASSET FROM PLAYLIST
export const removeAssetFromPlaylist = async (playlistId, assetId) => {
  const res = await fetch(
    `${BASE_URL}/api/playlists/${playlistId}/assets/${assetId}`,
    { method: "DELETE" }
  );
  return res.json();
};

// DELETE PLAYLIST
export const deletePlaylist = async (playlistId) => {
  const res = await fetch(
    `${BASE_URL}/api/playlists/${playlistId}`,
    { method: "DELETE" }
  );
  return res.json();
};

export const updatePlaylistAsset = async (
  playlistId,
  assetId,
  duration,
  sort_order
) => {
  const res = await fetch(
    `${BASE_URL}/api/playlists/${playlistId}/assets/${assetId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration, sort_order })
    }
  );
  return res.json();
};

export const savePlaylistOrder = async (playlistId, orderedIds) => {
  const res = await fetch(
    `http://localhost:5000/api/playlists/${playlistId}/order`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds })
    }
  );

  return res.json();
};

export const saveAssetDuration = (playlistId, assetId, duration) =>
  fetch(`http://localhost:5000/api/playlists/${playlistId}/assets/${assetId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duration })
  });


export const saveTickerConfig = async (playlistId, tickerConfig) => {
  const res = await fetch(
    `http://localhost:5000/api/playlists/${playlistId}/ticker`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickerConfig })
    }
  );
  return res.json();
};

export const savePlaylistLayout = (playlistId, layout) =>
  fetch(`${BASE_URL}/api/playlists/${playlistId}/layout`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ layout })
  }).then(res => res.json());





  