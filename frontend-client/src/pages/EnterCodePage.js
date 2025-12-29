import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pairDisplay } from "../services/api";

function EnterCodePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submitCode = async () => {
    try {
      await pairDisplay(code);
      localStorage.setItem("pairingCode", code);
      navigate("/dashboard");
    } catch {
      setError("Invalid pairing code");
    }
  };

  return (
    <div className="client-screen">
      <h1>Connect to TV</h1>

      <input
        placeholder="Enter pairing code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
      />

      <button onClick={submitCode}>Connect</button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default EnterCodePage;
