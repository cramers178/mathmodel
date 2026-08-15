import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function HostDashboard() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  
  const [settings, setSettings] = useState({
    questionCount: 15,
    timePerQuestion: 15,
    operators: ['+', '-', '*', '/']
  });
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('updatePlayers', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('updatePlayers');
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit('createRoom', settings, (res) => {
      setRoomCode(res.roomCode);
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('คัดลอกเลขห้องแล้ว: ' + roomCode);
  };

  const handleStartGame = () => {
    socket.emit('startGame', roomCode);
    navigate('/host/game', { state: { roomCode, settings } });
  };

  const handleToggleOperator = (op) => {
    setSettings(prev => {
      const ops = prev.operators.includes(op)
        ? prev.operators.filter(o => o !== op)
        : [...prev.operators, op];
      // Prevent unchecking all
      if (ops.length === 0) return prev;
      return { ...prev, operators: ops };
    });
  };

  if (roomCode) {
    return (
      <div className="view-container">
        <div className="card text-center animate-slide-in" style={{ width: '100%', maxWidth: '800px' }}>
          <h2 style={{ color: 'var(--yellow)', fontSize: '2rem' }}>ROOM CODE</h2>
          <h1 style={{ fontSize: '6rem', letterSpacing: '10px', margin: '1rem 0' }}>{roomCode}</h1>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <button className="btn btn-warning" onClick={copyRoomCode}>
              📋 คัดลอกเลขห้อง
            </button>
            <button className="btn" style={{ background: 'var(--dark-blue)', color: 'white' }} onClick={handleCreateRoom}>
              🔄 สร้างห้องใหม่
            </button>
            <button className="btn btn-danger" onClick={() => {
              socket.emit('closeRoom', roomCode);
              setRoomCode(null);
              setPlayers([]);
            }}>
              ปิดห้อง
            </button>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥 ผู้เล่น {players.length} คน</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {players.map((p, i) => (
                <div key={i} style={{ background: 'var(--electric-blue)', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 'bold' }}>
                  {p.name}
                </div>
              ))}
              {players.length === 0 && <div style={{ color: 'var(--text-muted)' }}>ยังไม่มีผู้เล่น...</div>}
            </div>
          </div>

          <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>ส่งเลขห้องให้นักเรียน แล้วรอให้ทุกคนเข้าห้องก่อนกดเริ่มเกม</div>
          <button className="btn btn-success" style={{ fontSize: '2rem', padding: '1.5rem 4rem', width: '100%' }} onClick={handleStartGame} disabled={players.length === 0}>
            🚀 START GAME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="card animate-slide-in" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' }}>⚙️ ตั้งค่าเกม</h2>
        
        <div className="settings-group">
          <label>จำนวนข้อ</label>
          <select 
            className="input-field"
            value={settings.questionCount}
            onChange={(e) => setSettings({...settings, questionCount: Number(e.target.value)})}
          >
            <option value={10}>10 ข้อ</option>
            <option value={15}>15 ข้อ</option>
            <option value={20}>20 ข้อ</option>
            <option value={30}>30 ข้อ</option>
          </select>
        </div>

        <div className="settings-group">
          <label>เวลาต่อข้อ</label>
          <select 
            className="input-field"
            value={settings.timePerQuestion}
            onChange={(e) => setSettings({...settings, timePerQuestion: Number(e.target.value)})}
          >
            <option value={10}>10 วินาที</option>
            <option value={15}>15 วินาที</option>
            <option value={20}>20 วินาที</option>
            <option value={30}>30 วินาที</option>
          </select>
        </div>

        <div className="settings-group">
          <label>ประเภทโจทย์</label>
          <div className="checkbox-group">
            {[
              { id: '+', label: '➕ บวก' },
              { id: '-', label: '➖ ลบ' },
              { id: '*', label: '✖️ คูณ' },
              { id: '/', label: '➗ หาร' }
            ].map(op => (
              <label key={op.id} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={settings.operators.includes(op.id)}
                  onChange={() => handleToggleOperator(op.id)}
                />
                {op.label}
              </label>
            ))}
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem', opacity: isConnected ? 1 : 0.6 }} 
          onClick={handleCreateRoom}
          disabled={!isConnected}
        >
          {isConnected ? '➕ สร้างห้อง' : '⏳ กำลังเชื่อมต่อเซิร์ฟเวอร์...'}
        </button>
        <button 
          className="btn" 
          style={{ width: '100%', marginTop: '1rem', background: 'transparent', color: 'var(--text-muted)' }}
          onClick={() => navigate('/')}
        >
          กลับ
        </button>
      </div>
    </div>
  );
}

export default HostDashboard;
