import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function HostActive() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomCode, settings } = location.state || {};

  const [questionData, setQuestionData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);

  useEffect(() => {
    if (!roomCode) {
      navigate('/host/dashboard');
      return;
    }

    socket.on('newQuestion', (data) => {
      setQuestionData(data);
      setTimeLeft(data.timePerQuestion);
      setCorrectAnswer(null);
    });

    socket.on('timerUpdate', (time) => {
      setTimeLeft(time);
    });

    socket.on('timeUp', (ans) => {
      setCorrectAnswer(ans);
    });

    socket.on('updateLeaderboard', (data) => {
      setLeaderboard(data);
    });

    socket.on('gameEnded', (finalLeaderboard) => {
      navigate('/results', { state: { leaderboard: finalLeaderboard, roomCode, isHost: true } });
    });

    return () => {
      socket.off('newQuestion');
      socket.off('timerUpdate');
      socket.off('timeUp');
      socket.off('updateLeaderboard');
      socket.off('gameEnded');
    };
  }, [navigate, roomCode]);

  const handleNext = () => {
    socket.emit('nextQuestion', roomCode);
  };

  const handleEndGame = () => {
    if (window.confirm('คุณต้องการจบเกมตอนนี้เลยหรือไม่?')) {
      socket.emit('endGame', roomCode);
    }
  };

  if (!questionData) return <div className="view-container"><h2>Loading...</h2></div>;

  const isTimeUp = correctAnswer !== null;

  return (
    <div className="view-container" style={{ flexDirection: 'row', gap: '2rem', alignItems: 'stretch' }}>
      {/* Left Panel: Question & Timer */}
      <div className="card" style={{ flex: '2', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ alignSelf: 'flex-start', background: 'var(--yellow)', color: 'var(--navy)', padding: '0.5rem 1rem', borderRadius: '1rem', fontWeight: 'bold' }}>
          ROOM: {roomCode}
        </div>
        
        <h2 style={{ fontSize: '2rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
          ข้อที่ {questionData.index} / {questionData.total}
        </h2>
        
        <div className={`timer-circle ${timeLeft <= 5 && !isTimeUp ? 'warning' : ''}`} style={{ marginTop: '2rem' }}>
          {isTimeUp ? '0' : timeLeft}
        </div>

        <div className="question-text" style={{ fontSize: '5rem' }}>{questionData.question}</div>

        {isTimeUp && (
          <div className="animate-slide-in" style={{ textAlign: 'center', marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid var(--emerald)', padding: '1rem 3rem', borderRadius: '1rem' }}>
            <h3 style={{ color: 'var(--emerald)' }}>คำตอบที่ถูกต้อง</h3>
            <h1 style={{ fontSize: '4rem', color: 'white' }}>{correctAnswer}</h1>
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', width: '100%' }}>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleEndGame}>
            🏁 จบเกม
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 2 }} 
            onClick={handleNext}
            disabled={!isTimeUp && timeLeft > 0} // Only allow next when time is up
          >
            ▶️ ข้อถัดไป
          </button>
        </div>
      </div>

      {/* Right Panel: Leaderboard */}
      <div className="card" style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--yellow)' }}>🏆 LEADERBOARD</h2>
        <ul className="leaderboard-list" style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {leaderboard.map((p, i) => (
            <li key={i} className={`leaderboard-item rank-${p.rank}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `${p.rank}.`}
                </span>
                <span>{p.name}</span>
              </div>
              <div>{p.score.toLocaleString()}</div>
            </li>
          ))}
          {leaderboard.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>ยังไม่มีคะแนน</div>}
        </ul>
      </div>
    </div>
  );
}

export default HostActive;
