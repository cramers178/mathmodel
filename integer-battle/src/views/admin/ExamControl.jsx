import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../socket';

function ExamControl() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [examStatus, setExamStatus] = useState(null);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('exam_status_update', (status) => setExamStatus(status));
    socket.on('exam_sessions_update', (data) => setSessions(data));
    
    return () => {
      socket.off('exam_status_update');
      socket.off('exam_sessions_update');
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    socket.emit('exam_admin_login', { password }, (res) => {
      if (res.success) {
        setIsLoggedIn(true);
        setExamStatus(res.status);
        setSessions(res.sessions);
      } else {
        alert('รหัสผ่านไม่ถูกต้อง');
      }
    });
  };

  const toggleExamOpen = () => {
    if (examStatus?.status === 'OPEN') {
      socket.emit('exam_close');
    } else {
      socket.emit('exam_open');
    }
  };

  const togglePause = () => {
    if (examStatus?.status === 'PAUSED') {
      socket.emit('exam_resume');
    } else {
      socket.emit('exam_pause');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="view-container">
        <div className="card text-center animate-slide-in" style={{ maxWidth: '500px', width: '100%' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '2.5rem', color: 'var(--yellow)' }}>🔒 ADMIN LOGIN</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--navy)' }}>
              เข้าสู่ระบบ Admin
            </button>
          </form>
          <button className="btn" style={{ marginTop: '1rem', background: 'transparent' }} onClick={() => navigate('/')}>กลับหน้าแรก</button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container" style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="title-main" style={{ fontSize: '2.5rem', margin: 0 }}>EXAM CONTROL CENTER</h1>
          <button className="btn" style={{ background: 'var(--red)', color: 'white' }} onClick={() => window.location.reload()}>ออกจากระบบ</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* CONTROL PANEL */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>แผงควบคุม</h2>
            
            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>สถานะปัจจุบัน</div>
              <div style={{ 
                fontSize: '2rem', fontWeight: 'bold', 
                color: examStatus?.status === 'OPEN' ? 'var(--emerald)' : examStatus?.status === 'PAUSED' ? 'var(--yellow)' : 'var(--red)' 
              }}>
                {examStatus?.status === 'OPEN' ? '🟢 OPEN' : examStatus?.status === 'PAUSED' ? '🟡 PAUSED' : '🔴 CLOSED'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn" 
                style={{ background: examStatus?.status === 'OPEN' ? 'var(--red)' : 'var(--emerald)', color: 'white' }}
                onClick={toggleExamOpen}
              >
                {examStatus?.status === 'OPEN' ? 'ปิดระบบสอบ' : 'เปิดระบบสอบ'}
              </button>

              <button 
                className="btn" 
                style={{ background: examStatus?.status === 'PAUSED' ? 'var(--emerald)' : 'var(--yellow)', color: 'black' }}
                onClick={togglePause}
                disabled={examStatus?.status === 'CLOSED'}
              >
                {examStatus?.status === 'PAUSED' ? '▶ ดำเนินการสอบต่อ' : '⏸ หยุดการสอบชั่วคราว (Pause)'}
              </button>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <h3>สรุปจำนวนผู้สอบ</h3>
              <p>นักเรียนที่กำลังสอบ: <strong style={{ color: 'var(--emerald)' }}>{examStatus?.activeStudents}</strong> คน</p>
              <p>นักเรียนที่ส่งแล้ว: <strong style={{ color: 'var(--yellow)' }}>{examStatus?.submittedStudents}</strong> คน</p>
            </div>
          </div>

          {/* MONITORING DASHBOARD */}
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>ANTI-CHEATING MONITOR</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem' }}>นักเรียน</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>ข้อที่ทำแล้ว</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>ความเสี่ยงทุจริต</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>ยังไม่มีนักเรียนเข้าสอบ</td>
                    </tr>
                  ) : sessions.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div><strong>{s.playerName}</strong></div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.studentId}</div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{s.answeredCount}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem', borderRadius: '4px',
                          background: s.suspiciousScore === 0 ? 'var(--emerald)' : s.suspiciousScore < 5 ? 'var(--yellow)' : 'var(--red)',
                          color: s.suspiciousScore === 0 ? 'white' : 'black',
                          fontWeight: 'bold'
                        }}>
                          {s.suspiciousScore === 0 ? 'Normal' : s.suspiciousScore < 5 ? 'Review' : 'High Alert'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: s.status === 'SUBMITTED' ? 'var(--emerald)' : 'white' }}>
                        {s.status === 'SUBMITTED' ? 'ส่งแล้ว' : 'กำลังสอบ'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ExamControl;
