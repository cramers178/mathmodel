import { fetchQuestions, saveAuditLog } from './examDB.js';

let examState = {
  status: 'CLOSED', // DRAFT, READY, OPEN, CLOSED, PAUSED
  settings: {
    name: 'แบบทดสอบวัดความสามารถเรื่องลำดับและอนุกรม',
    level: 'มัธยมศึกษาปีที่ 5',
    questionCount: 30,
    timeLimit: 45 * 60, // 45 minutes in seconds
    irtModel: '2PL'
  },
  questionPool: [],
  sessions: {}, // studentId -> { examSessionId, studentId, startTime, endTime, answers, status, logs }
  auditLogs: [] // overall audit logs
};

async function initExam() {
  examState.questionPool = await fetchQuestions();
  examState.status = 'READY';
  return examState;
}

function openExam() {
  if (examState.status === 'READY' || examState.status === 'CLOSED') {
    examState.status = 'OPEN';
  }
  return getExamStatus();
}

function closeExam() {
  examState.status = 'CLOSED';
  return getExamStatus();
}

function pauseExam() {
  if (examState.status === 'OPEN') {
    examState.status = 'PAUSED';
    // Pause all timers (logic can be added here or handled by client checking status)
  }
  return getExamStatus();
}

function resumeExam() {
  if (examState.status === 'PAUSED') {
    examState.status = 'OPEN';
  }
  return getExamStatus();
}

function generateExamForm(questionCount) {
  let pool = examState.questionPool.length > 0 ? examState.questionPool : [];
  if (pool.length === 0) return [];
  let shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(questionCount, shuffled.length));
}

function startSession(studentId, playerName) {
  if (examState.status !== 'OPEN') {
    throw new Error('ระบบสอบยังไม่เปิดให้เข้าสอบในขณะนี้');
  }
  if (examState.sessions[studentId] && examState.sessions[studentId].status !== 'SUBMITTED') {
    // Resume existing session if not submitted
    return examState.sessions[studentId];
  }

  let form = generateExamForm(examState.settings.questionCount);
  let sessionId = 'SESS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  
  let examItems = form.map((item, index) => {
    let choices = [...item.choices];
    choices.sort(() => 0.5 - Math.random());
    return {
      index: index + 1,
      itemId: item.itemId,
      question: item.question,
      choices: choices,
      topic: item.topic
    };
  });

  examState.sessions[studentId] = {
    studentId,
    playerName,
    examSessionId: sessionId,
    startTime: Date.now(),
    endTime: Date.now() + examState.settings.timeLimit * 1000,
    status: 'IN_PROGRESS',
    answers: {}, // itemId -> { answer, isCorrect, timestamp, responseTime }
    logs: [],
    form: form,
    examItems: examItems,
    suspiciousScore: 0
  };

  return examState.sessions[studentId];
}

function recordAnswer(studentId, itemId, answer) {
  const session = examState.sessions[studentId];
  if (!session || session.status !== 'IN_PROGRESS') return false;
  if (examState.status !== 'OPEN') return false; // paused or closed
  if (Date.now() > session.endTime) return false; // time up

  const item = session.form.find(q => q.itemId === itemId);
  if (!item) return false;

  const isCorrect = item.correctAnswer === answer;
  const prevAnswer = session.answers[itemId];
  const responseTime = prevAnswer ? Date.now() - prevAnswer.timestamp : 0;

  session.answers[itemId] = {
    answer,
    isCorrect,
    timestamp: Date.now(),
    responseTime
  };
  return true;
}

function logEvent(studentId, eventType, details = '') {
  const session = examState.sessions[studentId];
  const logEntry = {
    timestamp: Date.now(),
    studentId,
    eventType,
    details
  };
  
  if (session) {
    session.logs.push(logEntry);
    
    // Calculate suspicious score
    if (eventType === 'TAB_SWITCH') session.suspiciousScore += 1;
    if (eventType === 'WINDOW_BLUR') session.suspiciousScore += 0.5;
    if (eventType === 'DEVTOOLS_SUSPECTED') session.suspiciousScore += 3;
    if (eventType === 'FULLSCREEN_EXIT') session.suspiciousScore += 1;
    if (eventType === 'KEYBOARD_EVENT') session.suspiciousScore += 0.5;
  }
  
  examState.auditLogs.push(logEntry);
  saveAuditLog(logEntry); // Async save to DB
  
  return session ? session.suspiciousScore : 0;
}

function submitExam(studentId) {
  const session = examState.sessions[studentId];
  if (session && session.status === 'IN_PROGRESS') {
    session.status = 'SUBMITTED';
    session.endTime = Date.now();
  }
  return session;
}

function getExamStatus() {
  const sessionsArray = Object.values(examState.sessions);
  return {
    status: examState.status,
    settings: examState.settings,
    activeStudents: sessionsArray.filter(s => s.status === 'IN_PROGRESS').length,
    submittedStudents: sessionsArray.filter(s => s.status === 'SUBMITTED').length,
    totalStudents: sessionsArray.length
  };
}

function getAllSessions() {
  return Object.values(examState.sessions).map(s => ({
    studentId: s.studentId,
    playerName: s.playerName,
    status: s.status,
    suspiciousScore: s.suspiciousScore,
    logs: s.logs,
    answeredCount: Object.keys(s.answers).length
  }));
}

export { 
  initExam, openExam, closeExam, pauseExam, resumeExam, 
  startSession, recordAnswer, logEvent, submitExam, 
  getExamStatus, getAllSessions, examState 
};
