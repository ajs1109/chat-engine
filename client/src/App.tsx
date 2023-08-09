import { Route, Routes, BrowserRouter as Router,Navigate } from "react-router-dom";
import HomePage from "./components/Pages/HomePage.tsx";
import Chats from "./components/Pages/Chats.tsx";

function App() {
const user = JSON.parse(localStorage.getItem('profile') || '{}');
  return (
    <>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chats" element={user ? <Chats/> : <Navigate to="/"/>} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
