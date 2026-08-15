const DB_URL = "https://script.google.com/macros/s/AKfycbw4lc1u45Bek8-C8crk8nqTLwMD0vBjU_Pelc605n7G9tc9R8AtCIqAB1GulU9KPzx34A/exec";

// Use built-in fetch (Node 18+)
async function fetchQuestions() {
  try {
    const res = await fetch(DB_URL + '?action=getQuestions');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.questions; 
  } catch (err) {
    console.warn("Failed to fetch questions from DB. Returning mock data.");
    let mock = [];
    let topics = ['ลำดับเลขคณิต', 'ลำดับเรขาคณิต', 'อนุกรมเลขคณิต', 'อนุกรมเรขาคณิต', 'อนุกรมเรขาคณิตอนันต์'];
    for(let i=1; i<=30; i++) {
      mock.push({
        itemId: 'Q' + i,
        question: `ข้อทดสอบที่ ${i} (ข้อมูลจำลองเพราะเชื่อมต่อ Google Sheet ไม่ได้ หรือยังไม่ได้เขียนโค้ดรับฝั่ง GAS)`,
        choices: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        a: Number((Math.random() * 1.5 + 0.5).toFixed(2)),
        b: Number((Math.random() * 4 - 2).toFixed(2)),
        topic: topics[Math.floor(Math.random() * topics.length)]
      });
    }
    return mock;
  }
}

async function saveExamResult(resultData) {
  try {
    const res = await fetch(DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveResult', data: resultData })
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to save result to DB:", err);
    return { success: false };
  }
}

async function saveAuditLog(logData) {
  try {
    const res = await fetch(DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveAuditLog', data: logData })
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to save audit log to DB:", err);
    return { success: false };
  }
}

export { fetchQuestions, saveExamResult, saveAuditLog };
