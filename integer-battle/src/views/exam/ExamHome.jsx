import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../socket';

function ExamHome() {
  const [studentId, setStudentId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const handleStartExam = (e) => {
    e.preventDefault();
    if (!studentId || !playerName) {
      setError('กรุณากรอกรหัสนักเรียนและชื่อ-สกุลให้ครบถ้วน');
      return;
    }
    if (!accepted) {
      setError('กรุณากดยอมรับเงื่อนไขการสอบ');
      return;
    }

    socket.emit('exam_start_session', { studentId, playerName }, (res) => {
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        navigate('/exam/active', { state: { studentId, playerName, session: res.session } });
      }
    });
  };

  return (
    <div className="view-container">
      <div className="card animate-slide-in" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem', textAlign: 'center' }}>📝 EXAM MODE</h2>
        <h3 style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          ลำดับและอนุกรม คณิตศาสตร์ ม.5
        </h3>
        
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--red)', marginBottom: '2rem' }}>
          <h4 style={{ color: 'var(--red)', marginBottom: '1rem' }}>⚠️ กติกาการสอบ (Anti-Cheating Active)</h4>
          <ul style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
            <li>ห้ามออกจากหน้าสอบ หรือเปลี่ยน Tab</li>
            <li>ห้ามเปิดหลายหน้าต่าง หรือใช้เครื่องมือ Developer</li>
            <li>ห้าม Copy / Paste ข้อความใดๆ</li>
            <li>ห้าม Refresh หรือย้อนกลับหน้าต่าง Browser</li>
            <li>ระบบจะบันทึกเหตุการณ์ผิดปกติทุกครั้ง</li>
            <li>เมื่อหมดเวลา ระบบจะส่งข้อสอบอัตโนมัติ</li>
          </ul>
        </div>
        
        <form onSubmit={handleStartExam}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="รหัสนักเรียน (เช่น ST001)" 
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <input 
            type="text" 
            className="input-field" 
            placeholder="ชื่อ - สกุล" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={accepted} 
              onChange={(e) => setAccepted(e.target.checked)} 
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span>ข้าพเจ้ายอมรับเงื่อนไขและกติกาการสอบ</span>
          </label>

          {error && <div style={{ color: 'var(--red)', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--emerald)' }}>
            เริ่มการสอบ
          </button>
        </form>
        
        <button 
          className="btn" 
          style={{ marginTop: '1rem', background: 'transparent', color: 'var(--text-muted)', width: '100%' }}
          onClick={() => navigate('/')}
        >
          กลับหน้าแรก
        </button>
      </div>
    </div>
  );
}

export default ExamHome;
