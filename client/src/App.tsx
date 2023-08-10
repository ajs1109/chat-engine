import { Route, Routes, BrowserRouter as Router,Navigate } from "react-router-dom";
import HomePage from "./components/Pages/HomePage.tsx";
import Chats from "./components/Pages/Chats.tsx";
import { useEffect, useState } from "react";

function App() {
const [user,setUser] = useState( false);
useEffect(() => {
  if(localStorage.getItem('profile')){
    setUser(true);
  }
  else{
    setUser(false);
  }
},[localStorage]);
console.log('app_user : ',user);

  return (
    <>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={!user ? <HomePage /> : <Navigate to="/chats"/>} />
            <Route path="/chats" element={user ? <Chats/> : <Navigate to="/"/>} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
