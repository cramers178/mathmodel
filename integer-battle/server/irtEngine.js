// IRT 2PL Engine
function probability(theta, a, b) {
  return 1 / (1 + Math.exp(-a * (theta - b)));
}

// Calculate the log likelihood of a response pattern given theta
function logLikelihood(theta, responses, items) {
  let ll = 0;
  for (let i = 0; i < responses.length; i++) {
    let p = probability(theta, items[i].a, items[i].b);
    // bound p to avoid log(0)
    p = Math.max(0.0001, Math.min(0.9999, p));
    let u = responses[i]; // 1 for correct, 0 for incorrect
    ll += u * Math.log(p) + (1 - u) * Math.log(1 - p);
  }
  return ll;
}

// Estimate Theta using Maximum Likelihood Estimation (MLE) with simple grid search
function estimateTheta(responses, items) {
  let bestTheta = 0;
  let maxLL = -Infinity;
  
  // Search between -4.0 and +4.0
  for (let t = -4.0; t <= 4.0; t += 0.05) {
    let ll = logLikelihood(t, responses, items);
    if (ll > maxLL) {
      maxLL = ll;
      bestTheta = t;
    }
  }
  return Number(bestTheta.toFixed(2));
}

// Calculate Standard Error of Measurement (SEM) at given theta
function calculateSEM(theta, items) {
  let info = 0;
  for (let i = 0; i < items.length; i++) {
    let p = probability(theta, items[i].a, items[i].b);
    info += items[i].a * items[i].a * p * (1 - p);
  }
  if (info <= 0) return 3.0; // max reasonable SEM if info is flat
  return Number((1 / Math.sqrt(info)).toFixed(2));
}

function calculateScaleScore(theta) {
  // Transform theta (-4 to 4) to standard scale (e.g., T-score 50/10)
  let score = (theta * 10) + 50;
  return Number(Math.max(0, Math.min(100, score)).toFixed(1)); // cap between 0-100
}

export { estimateTheta, calculateSEM, calculateScaleScore, probability };
