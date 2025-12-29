import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../services/socket";

function DisplayPage() {
  const location = useLocation();
  const [media, setMedia] = useState(location.state?.media || null);

  useEffect(() => {
    const code = localStorage.getItem("pairingCode");
    socket.emit("join-tv", code);

    socket.on("play-media", (mediaData) => {
      console.log("MEDIA RECEIVED ON DISPLAY PAGE:", mediaData);
      setMedia(mediaData);
    });

    return () => socket.off("play-media");
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black"
      }}
    >
      {!media && (
        <h1 style={{ color: "white", textAlign: "center" }}>
          Waiting for content...
        </h1>
      )}

      {media?.type === "image" && (
        <img
          src={media.url}
          alt="TV Content"
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "contain"
          }}
        />
      )}

      {media?.type === "video" && (
        <video
          src={media.url}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "contain"
          }}
        />
      )}
    </div>
  );
}

export default DisplayPage;