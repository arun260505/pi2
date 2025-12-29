import { BrowserRouter, Routes, Route } from "react-router-dom";
import PairingPage from "./pages/PairingPage";
import DisplayPage from "./pages/DisplayPage";
import "./styles/tv.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PairingPage />} />
        <Route path="/display" element={<DisplayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
