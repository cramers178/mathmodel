function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(operators) {
  // operators is an array like ['+', '-', '*', '/']
  if (!operators || operators.length === 0) {
    operators = ['+', '-', '*', '/'];
  }
  
  const op = operators[Math.floor(Math.random() * operators.length)];
  let num1, num2, answer;
  
  switch (op) {
    case '+':
      num1 = getRandomInt(-20, 20);
      num2 = getRandomInt(-20, 20);
      answer = num1 + num2;
      break;
    case '-':
      num1 = getRandomInt(-20, 20);
      num2 = getRandomInt(-20, 20);
      answer = num1 - num2;
      break;
    case '*':
      num1 = getRandomInt(-12, 12);
      num2 = getRandomInt(-12, 12);
      answer = num1 * num2;
      break;
    case '/':
      // To ensure perfect division, we do: answer = a, num2 = b, num1 = a * b
      // So num1 / num2 = answer
      answer = getRandomInt(-12, 12);
      num2 = getRandomInt(-12, 12);
      while (num2 === 0) {
        num2 = getRandomInt(-12, 12);
      }
      num1 = answer * num2;
      break;
  }
  
  // Generate 3 wrong options
  const options = [answer];
  while (options.length < 4) {
    let wrong = answer + getRandomInt(-10, 10);
    // occasionally change sign or do common mistake
    if (Math.random() < 0.2) wrong = -answer;
    
    if (!options.includes(wrong) && wrong !== answer) {
      options.push(wrong);
    }
  }
  
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  // Format string properly (add brackets for negative numbers if needed)
  const formatNum = (n) => n < 0 ? `(${n})` : `${n}`;
  
  let questionString = '';
  switch (op) {
    case '+': questionString = `${formatNum(num1)} + ${formatNum(num2)} = ?`; break;
    case '-': questionString = `${formatNum(num1)} - ${formatNum(num2)} = ?`; break;
    case '*': questionString = `${formatNum(num1)} × ${formatNum(num2)} = ?`; break;
    case '/': questionString = `${formatNum(num1)} ÷ ${formatNum(num2)} = ?`; break;
  }
  
  return {
    question: questionString,
    options: options,
    answer: answer
  };
}

export {
  generateQuestion
};
