import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function GameActive() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomCode } = location.state || {};

  const [questionData, setQuestionData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct', 'wrong', null
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [earnedScore, setEarnedScore] = useState(0);

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    socket.on('newQuestion', (data) => {
      setQuestionData(data);
      setTimeLeft(data.timePerQuestion);
      setSelectedAnswer(null);
      setAnswerStatus(null);
      setCorrectAnswer(null);
      setEarnedScore(0);
    });

    socket.on('timerUpdate', (time) => {
      setTimeLeft(time);
    });

    socket.on('answerResult', (res) => {
      setAnswerStatus(res.correct ? 'correct' : 'wrong');
      setEarnedScore(res.score);
    });

    socket.on('timeUp', (correctAns) => {
      setCorrectAnswer(correctAns);
      if (!selectedAnswer) {
        setAnswerStatus('wrong'); // did not answer
      }
    });

    socket.on('gameEnded', (leaderboard) => {
      navigate('/results', { state: { leaderboard, roomCode } });
    });

    socket.on('roomClosed', (msg) => {
      alert(msg || 'Host ได้ปิดห้องนี้แล้ว');
      navigate('/');
    });

    return () => {
      socket.off('newQuestion');
      socket.off('timerUpdate');
      socket.off('answerResult');
      socket.off('timeUp');
      socket.off('gameEnded');
      socket.off('roomClosed');
    };
  }, [navigate, roomCode, selectedAnswer]);

  const handleSelectAnswer = (ans) => {
    if (selectedAnswer !== null || correctAnswer !== null) return;
    setSelectedAnswer(ans);
    socket.emit('submitAnswer', { roomCode, answer: ans });
  };

  if (!questionData) {
    return (
      <div className="view-container">
        <h2 style={{ animation: 'pulse 1s infinite' }}>กำลังเตรียมคำถาม...</h2>
      </div>
    );
  }

  const isTimeUp = correctAnswer !== null;

  return (
    <div className="view-container" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '2rem', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>ลำดับและอนุกรม ม.5</h2>
        <h3 style={{ background: 'var(--dark-blue)', padding: '0.5rem 1.5rem', borderRadius: '1rem' }}>
          ข้อที่ {questionData.index} / {questionData.total}
        </h3>
      </div>

      <div className={`timer-circle ${timeLeft <= 5 && !isTimeUp ? 'warning' : ''}`} style={{ marginBottom: '1rem' }}>
        {isTimeUp ? '0' : timeLeft}
      </div>

      {answerStatus && isTimeUp && (
        <div className="animate-slide-in" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {answerStatus === 'correct' ? (
            <h2 style={{ color: 'var(--emerald)', fontSize: '2.5rem' }}>🎉 CORRECT! (+{earnedScore})</h2>
          ) : (
            <h2 style={{ color: 'var(--red)', fontSize: '2.5rem' }}>❌ WRONG!</h2>
          )}
        </div>
      )}
      
      {!answerStatus && isTimeUp && !selectedAnswer && (
        <div className="animate-slide-in" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--yellow)', fontSize: '2.5rem' }}>⏰ TIME UP!</h2>
        </div>
      )}

      {isTimeUp && questionData?.explanation && (
        <div className="animate-slide-in" style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '1rem', 
          marginBottom: '1rem',
          textAlign: 'left',
          width: '100%',
          maxWidth: '800px',
          whiteSpace: 'pre-line'
        }}>
          <h3 style={{ color: 'var(--yellow)', marginBottom: '0.5rem' }}>เฉลยและวิธีทำ:</h3>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.5' }}>
            {questionData.explanation}
          </div>
        </div>
      )}

      {answerStatus && !isTimeUp && (
        <div className="animate-slide-in" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--yellow)', fontSize: '1.5rem' }}>รอกลุ่มเพื่อนตอบ...</h2>
        </div>
      )}

      <div className="question-text" style={{ fontSize: questionData.question.length > 50 ? '2rem' : '3rem', whiteSpace: 'pre-line' }}>
        {questionData.question}
      </div>

      <div className="grid-4" style={{ marginTop: 'auto', marginBottom: '2rem' }}>
        {questionData.options.map((opt, i) => {
          let btnClass = 'answer-btn';
          if (selectedAnswer === opt) {
            btnClass += ' selected';
          }
          if (isTimeUp) {
            if (opt === correctAnswer) btnClass += ' correct';
            else if (selectedAnswer === opt) btnClass += ' wrong';
          }

          return (
            <button
              key={i}
              className={btnClass}
              onClick={() => handleSelectAnswer(opt)}
              disabled={selectedAnswer !== null || isTimeUp}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GameActive;
