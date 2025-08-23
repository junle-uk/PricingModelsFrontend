// Binomial Option Pricing Model (Cox-Ross-Rubinstein)

export interface BinomialParams {
  spotPrice: number;      // S - Current asset price
  strikePrice: number;    // K - Strike price
  timeToMaturity: number; // T - Time to maturity in years
  volatility: number;     // σ - Volatility (as decimal, e.g., 0.2 for 20%)
  riskFreeRate: number;   // r - Risk-free interest rate (as decimal)
  steps: number;          // n - Number of time steps in the binomial tree
}

export interface BinomialResult {
  callPrice: number;
  putPrice: number;
  tree: BinomialNode[][];
}

export interface BinomialNode {
  stockPrice: number;
  callValue: number;
  putValue: number;
  probability: number;
}

// Main Binomial pricing function
export function calculateBinomial(params: BinomialParams): BinomialResult {
  const { spotPrice, strikePrice, timeToMaturity, volatility, riskFreeRate, steps } = params;
  
  if (timeToMaturity <= 0 || volatility <= 0 || spotPrice <= 0 || strikePrice <= 0 || steps <= 0) {
    return {
      callPrice: 0,
      putPrice: 0,
      tree: []
    };
  }

  const dt = timeToMaturity / steps;
  const u = Math.exp(volatility * Math.sqrt(dt));
  const d = 1 / u;
  const discountFactor = Math.exp(-riskFreeRate * dt);
  const p = (Math.exp(riskFreeRate * dt) - d) / (u - d);

  // Build the tree
  const tree: BinomialNode[][] = [];

  // Step 1: Build stock price tree (forward pass)
  for (let i = 0; i <= steps; i++) {
    const level: BinomialNode[] = [];
    for (let j = 0; j <= i; j++) {
      const stockPrice = spotPrice * Math.pow(u, i - j) * Math.pow(d, j);
      level.push({
        stockPrice,
        callValue: 0,
        putValue: 0,
        probability: 0
      });
    }
    tree.push(level);
  }

  // Step 2: Calculate option values at expiration (backward pass starts here)
  const lastLevel = tree[steps];
  for (let j = 0; j <= steps; j++) {
    const stockPrice = lastLevel[j].stockPrice;
    lastLevel[j].callValue = Math.max(0, stockPrice - strikePrice);
    lastLevel[j].putValue = Math.max(0, strikePrice - stockPrice);
    // Probability of reaching this node
    lastLevel[j].probability = binomialCoefficient(steps, j) * Math.pow(p, steps - j) * Math.pow(1 - p, j);
  }

  // Step 3: Backward induction to calculate option prices
  for (let i = steps - 1; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      const upValue = tree[i + 1][j];
      const downValue = tree[i + 1][j + 1];
      
      // Expected value discounted back
      const callValue = discountFactor * (p * upValue.callValue + (1 - p) * downValue.callValue);
      const putValue = discountFactor * (p * upValue.putValue + (1 - p) * downValue.putValue);
      
      tree[i][j].callValue = callValue;
      tree[i][j].putValue = putValue;
      
      // Calculate probability of reaching this node
      if (i > 0) {
        tree[i][j].probability = binomialCoefficient(i, j) * Math.pow(p, i - j) * Math.pow(1 - p, j);
      } else {
        tree[i][j].probability = 1; // Root node
      }
    }
  }

  return {
    callPrice: tree[0][0].callValue,
    putPrice: tree[0][0].putValue,
    tree
  };
}

// Binomial coefficient (n choose k)
function binomialCoefficient(n: number, k: number): number {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  
  // Use symmetry to reduce computation
  k = Math.min(k, n - k);
  
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  
  return result;
}

// Calculate Greeks using finite differences
export function calculateBinomialGreeks(
  params: BinomialParams,
  priceChange: number = 0.01,
  volChange: number = 0.01,
  timeChange: number = 1/365
): {
  delta: { call: number; put: number };
  gamma: number;
  theta: { call: number; put: number };
  vega: number;
  rho: { call: number; put: number };
} {
  const baseResult = calculateBinomial(params);
  
  // Delta: sensitivity to spot price
  const upParams = { ...params, spotPrice: params.spotPrice * (1 + priceChange) };
  const downParams = { ...params, spotPrice: params.spotPrice * (1 - priceChange) };
  const upResult = calculateBinomial(upParams);
  const downResult = calculateBinomial(downParams);
  
  const callDelta = (upResult.callPrice - downResult.callPrice) / (2 * params.spotPrice * priceChange);
  const putDelta = (upResult.putPrice - downResult.putPrice) / (2 * params.spotPrice * priceChange);
  
  // Gamma: second derivative with respect to spot price
  const midUpParams = { ...params, spotPrice: params.spotPrice * (1 + priceChange / 2) };
  const midDownParams = { ...params, spotPrice: params.spotPrice * (1 - priceChange / 2) };
  const midUpResult = calculateBinomial(midUpParams);
  const midDownResult = calculateBinomial(midDownParams);
  const gamma = (midUpResult.callPrice - 2 * baseResult.callPrice + midDownResult.callPrice) / 
                Math.pow(params.spotPrice * priceChange / 2, 2);
  
  // Theta: sensitivity to time (daily)
  const timeUpParams = { ...params, timeToMaturity: params.timeToMaturity - timeChange };
  const timeUpResult = calculateBinomial(timeUpParams);
  const callTheta = (timeUpResult.callPrice - baseResult.callPrice) / timeChange;
  const putTheta = (timeUpResult.putPrice - baseResult.putPrice) / timeChange;
  
  // Vega: sensitivity to volatility
  const volUpParams = { ...params, volatility: params.volatility + volChange };
  const volUpResult = calculateBinomial(volUpParams);
  const vega = (volUpResult.callPrice - baseResult.callPrice) / volChange;
  
  // Rho: sensitivity to interest rate
  const rateUpParams = { ...params, riskFreeRate: params.riskFreeRate + 0.01 };
  const rateUpResult = calculateBinomial(rateUpParams);
  const callRho = (rateUpResult.callPrice - baseResult.callPrice) / 0.01;
  const putRho = (rateUpResult.putPrice - baseResult.putPrice) / 0.01;
  
  return {
    delta: { call: callDelta, put: putDelta },
    gamma,
    theta: { call: callTheta, put: putTheta },
    vega,
    rho: { call: callRho, put: putRho }
  };
}

// Generate delta curve data for charting
export function generateBinomialDeltaCurve(
  baseParams: BinomialParams,
  spotPriceRange: { min: number; max: number; steps: number }
): { spotPrices: number[]; callDeltas: number[]; putDeltas: number[] } {
  const spotPrices: number[] = [];
  const callDeltas: number[] = [];
  const putDeltas: number[] = [];

  const step = (spotPriceRange.max - spotPriceRange.min) / spotPriceRange.steps;

  for (let i = 0; i <= spotPriceRange.steps; i++) {
    const spotPrice = spotPriceRange.min + i * step;
    spotPrices.push(spotPrice);

    const greeks = calculateBinomialGreeks({ ...baseParams, spotPrice });
    callDeltas.push(greeks.delta.call);
    putDeltas.push(greeks.delta.put);
  }

  return { spotPrices, callDeltas, putDeltas };
}
