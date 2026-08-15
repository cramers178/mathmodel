import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function FinalResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { leaderboard, roomCode, isHost } = location.state || {};

  useEffect(() => {
    if (!leaderboard) {
      navigate('/');
    }
    
    socket.on('roomClosed', (msg) => {
      if (!isHost) {
        alert(msg || 'Host ได้ปิดห้องนี้แล้ว');
        navigate('/');
      }
    });

    return () => {
      socket.off('roomClosed');
    };
  }, [navigate, leaderboard, isHost]);

  if (!leaderboard) return null;

  return (
    <div className="view-container">
      <div className="card animate-slide-in" style={{ width: '100%', maxWidth: '900px' }}>
        <h1 className="title-main" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆 สรุปผลคะแนน ลำดับและอนุกรม ม.5</h1>
        <h3 style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>ห้อง: {roomCode}</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Rank</th>
                <th style={{ padding: '1rem' }}>Player</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Score</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Correct</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: p.rank <= 3 ? `rgba(251, 191, 36, ${0.15 - p.rank * 0.04})` : 'transparent' }}>
                  <td style={{ padding: '1.5rem 1rem', fontSize: '1.5rem' }}>
                    {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank}
                  </td>
                  <td style={{ padding: '1.5rem 1rem', fontWeight: 'bold', fontSize: '1.25rem' }}>{p.name}</td>
                  <td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: '900', color: 'var(--yellow)', fontSize: '1.5rem' }}>
                    {p.score.toLocaleString()}
                  </td>
                  <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                    {p.correct}/{p.totalAnswered}
                  </td>
                  <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                    {p.accuracy}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          {isHost ? (
            <button className="btn btn-primary" onClick={() => navigate('/host/dashboard')}>
              กลับไปหน้าจัดการห้อง
            </button>
          ) : (
            <button className="btn" style={{ background: 'var(--dark-blue)', color: 'white' }} onClick={() => navigate('/')}>
              กลับหน้าแรก
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinalResults;
