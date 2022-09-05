import "./App.css";
import PreJoinPage from "./PreJoinPage";
import RoomPage from "./RoomPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PreJoinPage />} />
        <Route path="/room" element={<RoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
