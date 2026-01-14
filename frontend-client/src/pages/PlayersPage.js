import { useEffect, useState, useCallback } from "react";
import {
  getPlayers,
  registerPlayer,
  unregisterPlayer,
  getPlaylists
} from "../services/api";
import socket from "../services/socket";
import "../styles/dashboard.css";

function PlayersPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [players, setPlayers] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");

  const [form, setForm] = useState({
    pairingCode: "",
    name: "",
    timezone: "Asia/Calcutta",
    group: "default"
  });

  /* ================= LOAD PLAYERS ================= */
  const loadPlayers = useCallback(async () => {
    if (!user) return;
    const data = await getPlayers(user.userId);
    setPlayers(data);
  }, [user]);

  /* ================= LOAD PLAYLISTS ================= */
  const loadPlaylists = useCallback(async () => {
    if (!user) return;
    const data = await getPlaylists(user.userId);
    setPlaylists(data);
  }, [user]);

 useEffect(() => {
  if (!user?.userId) return;

  loadPlayers();
  loadPlaylists();
}, [user?.userId]);

  /* ================= REGISTER PLAYER ================= */
  const handleRegister = async () => {
  // 🔍 Check if pairing code already exists & paired
  const existingPlayer = players.find(
    (p) => p.pairing_code === form.pairingCode
  );

  if (existingPlayer && existingPlayer.is_paired === 1) {
    alert("❌ Player already registered with this pairing code");
    return;
  }

  const payload = {
    ...form,
    userId: user.userId
  };

  const res = await registerPlayer(payload);
  alert(res.message);

  setShowRegisterModal(false);
  setForm({
    pairingCode: "",
    name: "",
    timezone: "Asia/Calcutta",
    group: "default"
  });

  loadPlayers();
};


  /* ================= RUN PLAYLIST ================= */
  const handleRunPlaylist = () => {
    if (!selectedPlayer || !selectedPlaylist) {
      alert("Select a playlist");
      return;
    }

    socket.emit("play-playlist", {
      pairingCode: selectedPlayer.pairing_code,
      playlistId: selectedPlaylist
    });

    alert("Playlist sent to TV");
    loadPlayers();
    setShowRunModal(false);
    setSelectedPlaylist("");
    setSelectedPlayer(null);
  };

  /* ================= UNREGISTER ================= */
  const handleUnregister = async (id) => {
    if (!window.confirm("Unregister this player?")) return;
    const res = await unregisterPlayer(id);
    alert(res.message);
    loadPlayers();
  };

  return (
    <div>
      <div className="players-header">
        <h1>Registered Players</h1>
        <button onClick={() => setShowRegisterModal(true)}>
          Register a Player
        </button>
      </div>

      {/* ================= PLAYERS TABLE ================= */}
      <table border="1" cellPadding="10" width="100%" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pairing Code</th>
            <th>Location</th>
            <th>Group</th>
            <th>Current Playlist</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan="6" align="center">
                No players registered yet
              </td>
            </tr>
          ) : (
            players.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.pairing_code}</td>
                <td>{p.location || "-"}</td>
                <td>{p.group_name || "-"}</td>
                <td>{p.current_playlist_name ? p.current_playlist_name : "—"}</td>
                <td>{p.is_paired ? "Online" : "Offline"}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedPlayer(p);
                      setShowRunModal(true);
                    }}
                  >
                    ▶️
                  </button>
                  &nbsp;
                  <button onClick={() => handleUnregister(p.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= REGISTER MODAL ================= */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Register New Player</h2>

            <label>TV Pairing Code</label>
            <input
              value={form.pairingCode}
              onChange={(e) =>
                setForm({ ...form, pairingCode: e.target.value })
              }
            />

            <label>Player Name</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </button>
              <button className="primary" onClick={handleRegister}>
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RUN PLAYLIST MODAL ================= */}
      {showRunModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Run Playlist on {selectedPlayer?.name}</h2>

            <select
              value={selectedPlaylist}
              onChange={(e) => setSelectedPlaylist(e.target.value)}
            >
              <option value="">Select Playlist</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setShowRunModal(false)}
              >
                Cancel
              </button>
              <button className="primary" onClick={handleRunPlaylist}>
                ▶️ Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayersPage;