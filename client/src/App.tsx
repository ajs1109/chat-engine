import { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Chats from "./components/Pages/Chats.tsx";
import HomePage from "./components/Pages/HomePage.tsx";
import { getStoredProfile } from "./lib/profile";

function App() {
  const [user, setUser] = useState(Boolean(getStoredProfile().token));

  useEffect(() => {
    const syncAuthState = () => {
      setUser(Boolean(getStoredProfile().token));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={!user ? <HomePage /> : <Navigate to="/chats" />} />
          <Route path="/chats" element={user ? <Chats /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

