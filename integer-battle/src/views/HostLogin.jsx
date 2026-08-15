import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HostLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '173917') {
      navigate('/host/dashboard');
    } else {
      setError('รหัส Host ไม่ถูกต้อง');
    }
  };

  return (
    <div className="view-container">
      <div className="card text-center animate-slide-in" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>👑 เข้าสู่ระบบ Host</h2>
        
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            className="input-field" 
            placeholder="รหัส Host" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div style={{ color: 'var(--red)', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            เข้าสู่ระบบ Host
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

export default HostLogin;
