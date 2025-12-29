import { useEffect, useState, useCallback } from "react";
import { getPlayers, registerPlayer, unregisterPlayer } from "../services/api";
import socket from "../services/socket";
import "../styles/dashboard.css";

function PlayersPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [players, setPlayers] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Send-to-TV states
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);

 const [form, setForm] = useState({
  pairingCode: "",
  name: "",
  timezone: "Asia/Calcutta",
  group: "default"
});


   const loadPlayers = useCallback(async () => {
  if (!user) return;
  const data = await getPlayers(user.userId);
  setPlayers(data);
}, [user]);

  // 🔹 Load only logged-in user's players
 useEffect(() => {
  loadPlayers();
}, [loadPlayers]);


 


  // 🔹 Register player
  const handleRegister = async () => {
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

  // 🔹 Send media to TV
  const handleSendMedia = async () => {
    if (!mediaFile || !selectedPlayer) {
      alert("Please select a media file");
      return;
    }

    const type = mediaFile.type.startsWith("video") ? "video" : "image";

    const formData = new FormData();
    formData.append("file", mediaFile);
    formData.append("type", type);

    const res = await fetch("http://localhost:5000/api/media/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    socket.emit("send-media", {
      pairingCode: selectedPlayer.pairing_code,
      media: {
        type,
        url: `http://localhost:5000${data.media.url}`
      }
    });

    alert("Media sent to TV");

    setShowSendModal(false);
    setMediaFile(null);
    setSelectedPlayer(null);
  };

  // 🔹 Unregister player
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

      <table border="1" cellPadding="10" width="100%" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pairing Code</th>
            <th>Location</th>
            <th>Group</th>
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
                <td>{p.is_paired ? "Online" : "Offline"}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedPlayer(p);
                      setShowSendModal(true);
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

      {/* 🔹 REGISTER PLAYER MODAL */}
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

      {/* 🔹 SEND MEDIA MODAL */}
      {showSendModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Send Media to {selectedPlayer?.name}</h2>

            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMediaFile(e.target.files[0])}
            />

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => {
                  setShowSendModal(false);
                  setMediaFile(null);
                }}
              >
                Cancel
              </button>
              <button className="primary" onClick={handleSendMedia}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayersPage;