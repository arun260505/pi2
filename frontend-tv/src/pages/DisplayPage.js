import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
import "../styles/displayTicker.css";


function DisplayPage() {
  const [playlist, setPlaylist] = useState([]);
  const [tickerConfig, setTickerConfig] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  /* ================= JOIN TV ROOM ================= */
  useEffect(() => {
    const code = localStorage.getItem("pairingCode");
    if (code) {
      socket.emit("join-tv", code);
    }
  }, []);

  /* ================= RECEIVE PLAYLIST ================= */
  useEffect(() => {
    const handler = async ({ playlistId }) => {
      console.log("PLAYLIST RECEIVED:", playlistId);

      const res = await fetch(
        `http://localhost:5000/api/playlists/${playlistId}/assets`
      );
      const data = await res.json();

setPlaylist(data.assets || []);
let parsedTicker = null;

if (data.tickerConfig) {
  if (typeof data.tickerConfig === "object") {
    parsedTicker = data.tickerConfig;
  } else {
    try {
      parsedTicker = JSON.parse(data.tickerConfig);
    } catch (e) {
      console.error("Invalid ticker config", data.tickerConfig);
      parsedTicker = null;
    }
  }
}

setTickerConfig(parsedTicker);


      setCurrentIndex(0);
    };

    socket.on("start-playlist", handler);
    return () => socket.off("start-playlist", handler);
  }, []);

  /* ================= IMAGE TIMER ================= */
  useEffect(() => {
    if (!playlist.length) return;

    const current = playlist[currentIndex];
    if (!current) return;

    if (current.file_type === "image") {
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) =>
          prev + 1 >= playlist.length ? 0 : prev + 1
        );
      }, (current.duration || 10) * 1000);
    }

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, playlist]);

  /* ================= VIDEO END ================= */
  const handleVideoEnd = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= playlist.length ? 0 : prev + 1
    );
  };

  const current = playlist[currentIndex];

  


  /* ================= UI ================= */
  return (
    <div
  style={{
    width: "100vw",
    height: "100vh",
    background: "black",
    display: "flex",
    flexDirection: "column"
  }}
>

      {!current && (
        <h1 style={{ color: "white" }}>Waiting for playlist...</h1>
      )}

      {current?.file_type === "image" && (
  <div
  style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height:
  tickerConfig?.enabled && tickerConfig.place === "landscape"
    ? `calc(100vh - ${tickerConfig.height || 60}px)`
    : "100vh"

  }}
>

    <img
      src={`http://localhost:5000${current.file_path}`}
      alt=""
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain"
      }}
    />
  </div>
)}


      {current?.file_type === "video" && (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <video
      src={`http://localhost:5000${current.file_path}`}
      autoPlay
      muted
      playsInline
      onEnded={handleVideoEnd}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain"
      }}
    />
  </div>
)}

      {tickerConfig?.enabled &&
  Array.isArray(tickerConfig.messages) &&
  tickerConfig.messages.some(m => m.trim()) && (

 <div
  className={`display-ticker
    ${tickerConfig.speed || "medium"}
    ${tickerConfig.direction === "right" ? "right" : "left"}
    ${tickerConfig.place === "portrait" ? "portrait" : "landscape"}
  `}

  style={{
  height:
    tickerConfig.place === "landscape"
      ? tickerConfig.height || 60
      : "100%",

  width:
    tickerConfig.place === "portrait"
      ? tickerConfig.height || 60
      : "100%",

  fontSize: `${tickerConfig.fontSize || 20}px`,
  color: tickerConfig.color,
  background: tickerConfig.bgColor || "rgba(0,0,0,0.85)",
  flexShrink: 0
}}

>

   <div className="display-ticker-track">
  {tickerConfig.messages
    .filter(msg => msg.trim())
    .map((msg, index) => (
      <div key={index} className="ticker-item">
        <span
          className="display-ticker-text"
          style={{
            color: tickerConfig.color,
            textShadow: `0 0 6px ${tickerConfig.color}`
          }}
        >
          {msg}
        </span>
      </div>
    ))}
</div>

  </div>
)}



    </div>
  );
}

export default DisplayPage;