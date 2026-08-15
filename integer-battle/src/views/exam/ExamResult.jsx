import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};

  if (!result) {
    return (
      <div className="view-container">
        <div className="card text-center" style={{ maxWidth: '600px', width: '100%' }}>
          <h2>ไม่พบข้อมูลผลสอบ</h2>
          <button className="btn btn-primary" onClick={() => navigate('/exam')}>กลับไปหน้าแรก</button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="card animate-slide-in" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>ผลสอบประเมินค่าความสามารถ (IRT)</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>ผู้สอบ: {result.playerName}</h3>
          <p>รหัสนักเรียน: {result.studentId}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Ability (θ)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--emerald)' }}>
              {result.theta > 0 ? `+${result.theta}` : result.theta}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Scale Score</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--yellow)' }}>
              {result.scaleScore}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Standard Error (SEM)</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {result.sem}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>ความถูกต้อง (Accuracy)</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {result.accuracy}%
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/exam')} style={{ width: '100%' }}>
            กลับสู่หน้าหลักระบบสอบ
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamResult;
