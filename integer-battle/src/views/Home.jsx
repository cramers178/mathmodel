import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="view-container">
      <div className="card text-center animate-slide-in" style={{ maxWidth: '600px', width: '100%' }}>
        <h1 className="title-main" style={{ fontSize: '3rem', marginBottom: '1rem' }}>ลำดับและอนุกรม ม.5</h1>
        <h2 style={{ color: 'var(--yellow)', marginBottom: '3rem' }}>คณิตศาสตร์ ม.5 — เกมตอบคำถามออนไลน์</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '1.5rem', fontSize: '1.5rem' }}
              onClick={() => navigate('/player/join')}
            >
              🎮 PLAYER
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, padding: '1.5rem', fontSize: '1.5rem', background: 'var(--emerald)', color: 'white' }}
              onClick={() => navigate('/exam')}
            >
              📝 EXAM
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button 
              className="btn" 
              style={{ flex: 1, background: 'var(--dark-blue)', color: 'white', border: '2px solid var(--purple)' }}
              onClick={() => navigate('/host/login')}
            >
              👑 HOST (GAME)
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, background: 'var(--navy)', color: 'white', border: '2px solid var(--emerald)' }}
              onClick={() => navigate('/admin/exam')}
            >
              🔒 ADMIN (EXAM)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
