import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { socket } from './socket';

import Home from './views/Home';
import HostLogin from './views/HostLogin';
import HostDashboard from './views/HostDashboard';
import PlayerLobby from './views/PlayerLobby';
import GameActive from './views/GameActive';
import HostActive from './views/HostActive';
import FinalResults from './views/FinalResults';

// Exam Routes
import ExamHome from './views/exam/ExamHome';
import ExamActive from './views/exam/ExamActive';
import ExamResult from './views/exam/ExamResult';
import ExamControl from './views/admin/ExamControl';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        {!isConnected && <div className="connection-status">Connecting to server...</div>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host/login" element={<HostLogin />} />
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/game" element={<HostActive />} />
          <Route path="/player/join" element={<PlayerLobby />} />
          <Route path="/game" element={<GameActive />} />
          <Route path="/results" element={<FinalResults />} />
          
          {/* EXAM MODE ROUTES */}
          <Route path="/exam" element={<ExamHome />} />
          <Route path="/exam/active" element={<ExamActive />} />
          <Route path="/exam/result" element={<ExamResult />} />
          
          <Route path="/admin/exam" element={<ExamControl />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
