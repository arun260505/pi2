import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerDisplay } from "../services/api";
import socket from "../services/socket";

function PairingPage() {
  const [code, setCode] = useState(null);
  const navigate = useNavigate();

  // Generate pairing code ONCE
  useEffect(() => {
    const savedCode = localStorage.getItem("pairingCode");

    if (savedCode) {
      setCode(savedCode);
      socket.emit("join-tv", savedCode);
      return;
    }

    registerDisplay().then((data) => {
      if (!data?.pairingCode) return;

      localStorage.setItem("pairingCode", data.pairingCode);
      setCode(data.pairingCode);
      socket.emit("join-tv", data.pairingCode);
    });
  }, []);

  // 🔥 THIS IS THE KEY CHANGE
  useEffect(() => {
    socket.on("play-media", (media) => {
      console.log("MEDIA RECEIVED ON PAIRING PAGE:", media);

      // Move to DisplayPage ONLY when media arrives
      navigate("/display", { state: { media } });
    });

    return () => socket.off("play-media");
  }, [navigate]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <h1>PAIR THIS TV</h1>
      <h2>{code ?? "Generating code..."}</h2>
      <p>Enter this code in the client dashboard</p>
    </div>
  );
}

export default PairingPage;