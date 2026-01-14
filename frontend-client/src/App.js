import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EnterCodePage from "./pages/EnterCodePage";
import DashboardPage from "./pages/DashboardPage";
import "./styles/client.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* App pages */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/enter-code" element={<EnterCodePage />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
