import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginScreen from "./pages/LoginScreen";

// Ruta protegida para el chat
function ProtectedRoute({ children }) {
  const nickname = localStorage.getItem("nickname");
  
  if (!nickname) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Ruta pública - si ya está logueado, va al chat
function PublicRoute({ children }) {
  const nickname = localStorage.getItem("nickname");
  
  if (nickname) {
    return <Navigate to="/chat" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LoginHandler />
            </PublicRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

function LoginHandler() {
  const navigate = useNavigate();
  const [, setNickname] = useState("");

  const handleJoin = (name) => {
    setNickname(name);
    localStorage.setItem("nickname", name);
    navigate("/chat");
  };

  return <LoginScreen onJoin={handleJoin} />;
}

export default App;