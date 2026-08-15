import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function PlayerLobby() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('gameStarted', () => {
      navigate('/game', { state: { roomCode, playerName } });
    });

    socket.on('roomClosed', (msg) => {
      alert(msg || 'Host ได้ปิดห้องนี้แล้ว');
      setJoined(false);
      setRoomCode('');
    });

    return () => {
      socket.off('gameStarted');
      socket.off('roomClosed');
    };
  }, [navigate, roomCode, playerName]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode || !playerName) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (roomCode.length !== 6) {
      setError('เลขห้องต้องเป็น 6 หลัก');
      return;
    }

    socket.emit('joinRoom', { roomCode, playerName }, (res) => {
      if (res.error) {
        setError(res.error);
      } else {
        setJoined(true);
        setError('');
      }
    });
  };

  if (joined) {
    return (
      <div className="view-container">
        <div className="card text-center animate-slide-in" style={{ maxWidth: '500px', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--emerald)' }}>เข้าห้องสำเร็จ!</h2>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>ห้อง: <span style={{ color: 'white', letterSpacing: '2px' }}>{roomCode}</span></h3>
          
          <div style={{ margin: '3rem 0', fontSize: '1.5rem', animation: 'pulse 2s infinite' }}>
            รอ Host เริ่มเกม...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="card text-center animate-slide-in" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>🎮 เข้าร่วมเกมลำดับและอนุกรม</h2>
        
        <form onSubmit={handleJoin}>
          <input 
            type="number" 
            className="input-field" 
            placeholder="เลขห้อง (6 หลัก)" 
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <input 
            type="text" 
            className="input-field" 
            placeholder="ชื่อผู้เล่น" 
            maxLength={15}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          
          {error && <div style={{ color: 'var(--red)', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            เข้าร่วมเกม
          </button>
        </form>
        
        <button 
          className="btn" 
          style={{ marginTop: '1rem', background: 'transparent', color: 'var(--text-muted)' }}
          onClick={() => navigate('/')}
        >
          กลับหน้าแรก
        </button>
      </div>
    </div>
  );
}

export default PlayerLobby;
