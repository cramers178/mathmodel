function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateArithmeticSequence(level) {
  let a1, d, n, answer, questionString, explanation;
  
  if (level === 1) {
    a1 = getRandomInt(-10, 20);
    d = getRandomInt(2, 8) * (Math.random() < 0.5 ? 1 : -1);
    answer = a1 + 3 * d;
    questionString = `กำหนดลำดับเลขคณิต: ${a1}, ${a1+d}, ${a1+2*d}, ... พจน์ต่อไปคือเท่าใด?`;
    explanation = `a₁ = ${a1}, d = ${d}\nพจน์ที่ 4 = ${a1} + 3(${d}) = ${answer}`;
  } else if (level === 2) {
    a1 = getRandomInt(-20, 20);
    d = getRandomInt(-10, 10);
    if (d === 0) d = 3;
    n = getRandomInt(10, 30);
    answer = a1 + (n - 1) * d;
    questionString = `ลำดับเลขคณิต ${a1}, ${a1+d}, ${a1+2*d}, ... พจน์ที่ ${n} มีค่าเท่าใด?`;
    explanation = `a₁ = ${a1}, d = ${d}, n = ${n}\naₙ = a₁ + (n - 1)d\na${n} = ${a1} + (${n}-1)(${d}) = ${answer}`;
  } else {
    d = getRandomInt(2, 9) * (Math.random() < 0.5 ? 1 : -1);
    n = getRandomInt(8, 20);
    a1 = getRandomInt(-30, 30);
    let an = a1 + (n - 1) * d;
    answer = d;
    questionString = `ลำดับเลขคณิตมีพจน์แรกคือ ${a1} และพจน์ที่ ${n} คือ ${an} ผลต่างร่วม (d) มีค่าเท่าใด?`;
    explanation = `a₁ = ${a1}, a${n} = ${an}\naₙ = a₁ + (n - 1)d\n${an} = ${a1} + (${n}-1)d\n${an - a1} = ${n - 1}d\nd = ${answer}`;
  }

  return { question: questionString, answer, explanation };
}

function generateGeometricSequence(level) {
  let a1, r, n, answer, questionString, explanation;
  
  if (level === 1) {
    a1 = getRandomInt(1, 5) * (Math.random() < 0.5 ? 1 : -1);
    r = getRandomInt(2, 4) * (Math.random() < 0.5 ? 1 : -1);
    answer = a1 * Math.pow(r, 3);
    questionString = `กำหนดลำดับเรขาคณิต: ${a1}, ${a1*r}, ${a1*Math.pow(r,2)}, ... พจน์ต่อไปคือเท่าใด?`;
    explanation = `a₁ = ${a1}, r = ${r}\nพจน์ที่ 4 = ${a1}(${r})³ = ${answer}`;
  } else if (level === 2) {
    a1 = getRandomInt(1, 5);
    r = getRandomInt(2, 3) * (Math.random() < 0.5 ? 1 : -1);
    n = getRandomInt(5, 7);
    answer = a1 * Math.pow(r, n - 1);
    questionString = `ลำดับเรขาคณิต ${a1}, ${a1*r}, ${a1*Math.pow(r,2)}, ... พจน์ที่ ${n} มีค่าเท่าใด?`;
    explanation = `a₁ = ${a1}, r = ${r}, n = ${n}\naₙ = a₁rⁿ⁻¹\na${n} = ${a1}(${r})^${n-1} = ${answer}`;
  } else {
    r = getRandomInt(3, 5);
    a1 = getRandomInt(1, 4);
    let a3 = a1 * r * r;
    answer = r;
    questionString = `ลำดับเรขาคณิตมีพจน์แรกคือ ${a1} และพจน์ที่ 3 คือ ${a3} (อัตราส่วนร่วมเป็นบวก) อัตราส่วนร่วม (r) คือเท่าใด?`;
    explanation = `a₁ = ${a1}, a₃ = ${a3}\naₙ = a₁rⁿ⁻¹\n${a3} = ${a1}r²\nr² = ${a3/a1}\nr = ${answer}`;
  }

  return { question: questionString, answer, explanation };
}

function generateArithmeticSeries(level) {
  let a1, d, n, answer, questionString, explanation;
  
  if (level === 1) {
    a1 = getRandomInt(1, 10);
    d = getRandomInt(2, 5);
    n = getRandomInt(5, 10);
    answer = (n / 2) * (2 * a1 + (n - 1) * d);
    let a2 = a1 + d;
    let a3 = a1 + 2 * d;
    questionString = `จงหาผลบวก ${n} พจน์แรกของอนุกรมเลขคณิต: ${a1} + ${a2} + ${a3} + ...`;
    explanation = `a₁ = ${a1}, d = ${d}, n = ${n}\nSₙ = n/2 [2a₁ + (n - 1)d]\nS${n} = ${n}/2 [2(${a1}) + (${n}-1)(${d})] = ${answer}`;
  } else {
    n = getRandomInt(10, 20) * 2; // Ensure even n for simple division
    a1 = getRandomInt(1, 20);
    d = getRandomInt(2, 6);
    let an = a1 + (n - 1) * d;
    answer = (n / 2) * (a1 + an);
    questionString = `อนุกรมเลขคณิตมี ${n} พจน์ พจน์แรกคือ ${a1} และพจน์สุดท้ายคือ ${an} ผลบวกของอนุกรมนี้คือเท่าใด?`;
    explanation = `a₁ = ${a1}, aₙ = ${an}, n = ${n}\nSₙ = n/2 (a₁ + aₙ)\nS${n} = ${n}/2 (${a1} + ${an}) = ${answer}`;
  }
  
  return { question: questionString, answer, explanation };
}

function generateGeometricSeries(level) {
  let a1, r, n, answer, questionString, explanation;
  
  if (level === 1 || level === 2) {
    a1 = getRandomInt(1, 3);
    r = getRandomInt(2, 3);
    n = getRandomInt(4, 6);
    answer = a1 * (Math.pow(r, n) - 1) / (r - 1);
    let a2 = a1 * r;
    let a3 = a1 * r * r;
    questionString = `จงหาผลบวก ${n} พจน์แรกของอนุกรมเรขาคณิต: ${a1} + ${a2} + ${a3} + ...`;
    explanation = `a₁ = ${a1}, r = ${r}, n = ${n}\nSₙ = a₁(rⁿ - 1)/(r - 1)\nS${n} = ${a1}(${r}^${n} - 1)/(${r} - 1) = ${answer}`;
  } else {
    let rs = [[1, 2], [1, 3], [-1, 2], [-1, 3]];
    let r_choice = rs[Math.floor(Math.random() * rs.length)];
    let r_num = r_choice[0];
    let r_den = r_choice[1];
    
    let k = getRandomInt(1, 4) * r_den * r_den;
    answer = r_den * k;
    a1 = k * (r_den - r_num);
    
    let a2 = a1 * r_num / r_den;
    let a3 = a1 * r_num * r_num / (r_den * r_den);
    
    let a2_str = a2 < 0 ? `- ${Math.abs(a2)}` : `+ ${a2}`;
    let a3_str = `+ ${a3}`;
    
    let r_str = r_num < 0 ? `-${Math.abs(r_num)}/${r_den}` : `${r_num}/${r_den}`;
    questionString = `จงหาผลบวกของอนุกรมเรขาคณิตอนันต์: ${a1} ${a2_str} ${a3_str} + ...`;
    explanation = `a₁ = ${a1}, r = ${r_str}\nเนื่องจาก |r| < 1 อนุกรมลู่เข้า\nS∞ = a₁ / (1 - r)\nS∞ = ${a1} / (1 - (${r_str})) = ${answer}`;
  }
  
  return { question: questionString, answer, explanation };
}

function generateQuestion(categories) {
  if (!categories || categories.length === 0) {
    categories = ['arithmetic_seq', 'geometric_seq', 'arithmetic_series', 'geometric_series'];
  }
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  let level = Math.random() < 0.4 ? 1 : (Math.random() < 0.7 ? 2 : 3);
  
  let qData;
  switch (category) {
    case 'arithmetic_seq':
      qData = generateArithmeticSequence(level);
      break;
    case 'geometric_seq':
      qData = generateGeometricSequence(level);
      break;
    case 'arithmetic_series':
      qData = generateArithmeticSeries(level);
      break;
    case 'geometric_series':
      qData = generateGeometricSeries(level);
      break;
    default:
      qData = generateArithmeticSequence(level);
  }
  
  let { question, answer, explanation } = qData;
  
  const options = [answer];
  while (options.length < 4) {
    let wrong;
    if (Math.abs(answer) > 100) {
       wrong = answer + getRandomInt(-5, 5) * 10;
       if (wrong === answer) wrong += 10;
    } else {
       wrong = answer + getRandomInt(-15, 15);
       if (wrong === answer) wrong += 2;
    }
    
    if (Math.random() < 0.1) wrong = -answer;
    
    if (!options.includes(wrong) && wrong !== answer && !Number.isNaN(wrong)) {
      options.push(wrong);
    }
  }
  
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return {
    question: question,
    options: options,
    answer: answer,
    explanation: explanation,
    category: category
  };
}

export {
  generateQuestion
};

