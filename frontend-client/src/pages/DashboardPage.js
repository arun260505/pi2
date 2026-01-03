import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import "../styles/dashboard.css";
import PlayersPage from "./PlayersPage";
import { getPlayers } from "../services/api";
import AssetsPage from "./AssetsPage";
import PlaylistsPage from "./PlaylistsPage";
function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [active, setActive] = useState("dashboard");
  const [players, setPlayers] = useState([]);
const [selectedPlayer, setSelectedPlayer] = useState(null);
const [file, setFile] = useState(null);
const [error, setError] = useState("");

  // 🔐 Protect dashboard
  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  // 📤 Send media
  const sendMedia = async () => {
  if (!file || !selectedPlayer) {
    setError("Please select a player and a file");
    return;
  }


    const type = file.type.startsWith("video") ? "video" : "image";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
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


      setError("");
      alert("Media sent to TV");
    } catch {
      setError("Failed to send media");
    }
  };

  useEffect(() => {
  if (!user) return;

  const loadPlayers = async () => {
    const data = await getPlayers(user.userId);
    setPlayers(data);
  };

  loadPlayers();
}, [user]);


  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">piSignage</h2>

        <ul>
          <li className={active==="dashboard" ? "active" : ""} onClick={() => setActive("dashboard")}>Dashboard</li>
          <li className={active==="players" ? "active" : ""} onClick={() => setActive("players")}>Players</li>
          <li className={active==="groups" ? "active" : ""} onClick={() => setActive("groups")}>Groups</li>
          <li className={active==="assets" ? "active" : ""} onClick={() => setActive("assets")}>Assets</li>
          <li className={active==="playlists" ? "active" : ""} onClick={() => setActive("playlists")}>Playlists</li>
        </ul>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <span>Welcome {user?.username}</span>
          <button onClick={logout}>Logout</button>
        </header>

        <div className="content">
          {active === "dashboard" && (
            <>
              <h1>Send Media to TV</h1>
              <select
  value={selectedPlayer?.id || ""}
  onChange={(e) => {
    const player = players.find(
      (p) => p.id === Number(e.target.value)
    );
    setSelectedPlayer(player);
  }}
>
  <option value="">Select Player</option>
  {players.map((p) => (
    <option key={p.id} value={p.id}>
      {p.name} ({p.location || "Unknown"})
    </option>
  ))}
</select>


              

              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <button onClick={sendMedia}>Send to TV</button>

              {error && <p style={{ color: "red" }}>{error}</p>}
            </>
          )}

          {active === "players" && <PlayersPage />}
          {active === "groups" && <h1>Groups (Coming soon)</h1>}
          {active === "assets" && <AssetsPage />}
          {active === "playlists" && <PlaylistsPage />}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;