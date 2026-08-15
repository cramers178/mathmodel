import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../../socket';

function ExamActive() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId, playerName, session } = location.state || {};
  
  const [examItems, setExamItems] = useState(session?.examItems || []);
  const [answers, setAnswers] = useState(session?.answers || {});
  const [timeLeft, setTimeLeft] = useState(session?.timeLeft || 0);
  const [warnings, setWarnings] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const containerRef = useRef(null);

  useEffect(() => {
    if (!studentId) {
      navigate('/exam');
      return;
    }

    // Force fullscreen if possible
    const enterFullscreen = async () => {
      if (document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.warn("Fullscreen error", err);
        }
      }
    };
    enterFullscreen();

    // Timer sync
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Socket listeners
    socket.on('exam_paused', () => setIsPaused(true));
    socket.on('exam_resumed', () => setIsPaused(false));
    socket.on('exam_forced_closed', () => {
      alert("ระบบสอบถูกปิดโดยผู้ดูแล");
      navigate('/exam');
    });

    return () => {
      clearInterval(timerInterval);
      socket.off('exam_paused');
      socket.off('exam_resumed');
      socket.off('exam_forced_closed');
    };
  }, [studentId, navigate]);

  // Anti-Cheating Event Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent('TAB_SWITCH', 'User switched tabs or minimized window');
        showWarning('ตรวจพบการออกจากหน้าสอบ');
      }
    };

    const handleBlur = () => {
      logEvent('WINDOW_BLUR', 'Window lost focus');
      showWarning('ตรวจพบการคลิกออกจากหน้าต่างสอบ');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logEvent('FULLSCREEN_EXIT', 'Exited fullscreen mode');
        showWarning('กรุณากลับเข้าสู่โหมดเต็มหน้าจอ');
      }
    };

    const handleKeyDown = (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+C, Ctrl+V, etc.
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.key === 'c') || 
        (e.ctrlKey && e.key === 'v')
      ) {
        e.preventDefault();
        logEvent('KEYBOARD_EVENT', `Blocked key combination: ${e.key}`);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      logEvent('KEYBOARD_EVENT', 'Blocked right click context menu');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [studentId]);

  const logEvent = (eventType, details) => {
    socket.emit('exam_log_event', { studentId, eventType, details });
  };

  const showWarning = (msg) => {
    setWarnings(prev => prev + 1);
    alert(`⚠️ คำเตือน: ${msg}\nระบบได้บันทึกความผิดปกติแล้ว`);
  };

  const handleSelectAnswer = (itemId, choice) => {
    if (isPaused) return;
    const newAnswers = { ...answers, [itemId]: { answer: choice } };
    setAnswers(newAnswers);
    
    // Auto-save
    socket.emit('exam_record_answer', { studentId, itemId, answer: choice }, (res) => {
      if (!res.success) {
        console.warn("Failed to save answer to server");
      }
    });
  };

  const submitExam = () => {
    if (window.confirm("คุณต้องการส่งข้อสอบใช่หรือไม่? เมื่อส่งแล้วจะไม่สามารถแก้ไขได้อีก") || timeLeft <= 0) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.warn(err));
      }
      socket.emit('exam_submit', { studentId }, (res) => {
        if (res.success) {
          navigate('/exam/result', { state: { result: res.result } });
        } else {
          alert('เกิดข้อผิดพลาดในการส่งข้อสอบ');
        }
      });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!studentId || !session) return null;

  return (
    <div className="view-container" style={{ padding: '0' }} ref={containerRef}>
      {/* HEADER */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1rem 2rem', background: 'var(--navy)', borderBottom: '2px solid rgba(255,255,255,0.1)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{session.playerName} ({studentId})</h2>
          <div style={{ color: 'var(--text-muted)' }}>จำนวนข้อ: {examItems.length} ข้อ</div>
        </div>
        
        {isPaused ? (
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--yellow)' }}>
            🔒 EXAM PAUSED
          </div>
        ) : (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>TIME REMAINING</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: timeLeft < 300 ? 'var(--red)' : 'white' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>

      {/* QUESTIONS */}
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', opacity: isPaused ? 0.2 : 1, pointerEvents: isPaused ? 'none' : 'auto' }}>
        {examItems.map((item, index) => (
          <div key={item.itemId} className="card" style={{ marginBottom: '2rem', textAlign: 'left', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--yellow)', fontSize: '1.5rem' }}>ข้อที่ {index + 1}</h3>
              <span style={{ color: 'var(--text-muted)' }}>{item.topic}</span>
            </div>
            
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              {item.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {item.choices.map((choice, cIdx) => (
                <button
                  key={cIdx}
                  className="btn"
                  style={{ 
                    textAlign: 'left', padding: '1rem 1.5rem', 
                    background: answers[item.itemId]?.answer === choice ? 'var(--emerald)' : 'rgba(255,255,255,0.05)',
                    border: answers[item.itemId]?.answer === choice ? '2px solid white' : '2px solid transparent',
                    color: 'white',
                    fontSize: '1.1rem'
                  }}
                  onClick={() => handleSelectAnswer(item.itemId, choice)}
                >
                  <span style={{ display: 'inline-block', width: '30px', fontWeight: 'bold' }}>{String.fromCharCode(65 + cIdx)}.</span> 
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1.5rem', fontSize: '1.5rem', marginTop: '2rem', background: 'var(--emerald)' }}
          onClick={submitExam}
        >
          ส่งข้อสอบ
        </button>
      </div>

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 100, flexDirection: 'column'
        }}>
          <h1 style={{ color: 'var(--yellow)', fontSize: '4rem', marginBottom: '1rem' }}>🔒</h1>
          <h2>ระบบสอบถูกหยุดชั่วคราวโดยผู้ดูแล</h2>
          <p style={{ color: 'var(--text-muted)' }}>กรุณารอจนกว่าผู้ดูแลจะเปิดระบบอีกครั้ง (เวลาสอบจะหยุดนับ)</p>
        </div>
      )}
    </div>
  );
}

export default ExamActive;
