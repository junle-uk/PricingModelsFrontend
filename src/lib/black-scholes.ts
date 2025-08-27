// Black-Scholes Option Pricing Model

// Standard normal cumulative distribution function
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Standard normal probability density function
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export interface BlackScholesParams {
  spotPrice: number;      // S - Current asset price
  strikePrice: number;    // K - Strike price
  timeToMaturity: number; // T - Time to maturity in years
  volatility: number;     // σ - Volatility (as decimal, e.g., 0.2 for 20%)
  riskFreeRate: number;   // r - Risk-free interest rate (as decimal)
}

export interface BlackScholesResult {
  callPrice: number;
  putPrice: number;
  d1: number;
  d2: number;
}

export interface Greeks {
  delta: { call: number; put: number };
  gamma: number;
  theta: { call: number; put: number };
  vega: number;
  rho: { call: number; put: number };
}

// Calculate d1 and d2
function calculateD1D2(params: BlackScholesParams): { d1: number; d2: number } {
  const { spotPrice, strikePrice, timeToMaturity, volatility, riskFreeRate } = params;
  
  if (timeToMaturity <= 0 || volatility <= 0 || spotPrice <= 0 || strikePrice <= 0) {
    return { d1: 0, d2: 0 };
  }

  const d1 = (Math.log(spotPrice / strikePrice) + 
    (riskFreeRate + (volatility * volatility) / 2) * timeToMaturity) / 
    (volatility * Math.sqrt(timeToMaturity));
  
  const d2 = d1 - volatility * Math.sqrt(timeToMaturity);

  return { d1, d2 };
}

// Main Black-Scholes pricing function
export function calculateBlackScholes(params: BlackScholesParams): BlackScholesResult {
  const { spotPrice, strikePrice, timeToMaturity, volatility, riskFreeRate } = params;
  
  if (timeToMaturity <= 0 || volatility <= 0 || spotPrice <= 0 || strikePrice <= 0) {
    return { callPrice: 0, putPrice: 0, d1: 0, d2: 0 };
  }

  const { d1, d2 } = calculateD1D2(params);
  
  const discountFactor = Math.exp(-riskFreeRate * timeToMaturity);
  
  const callPrice = spotPrice * normalCDF(d1) - strikePrice * discountFactor * normalCDF(d2);
  const putPrice = strikePrice * discountFactor * normalCDF(-d2) - spotPrice * normalCDF(-d1);

  return {
    callPrice: Math.max(0, callPrice),
    putPrice: Math.max(0, putPrice),
    d1,
    d2
  };
}

// Calculate Greeks
export function calculateGreeks(params: BlackScholesParams): Greeks {
  const { spotPrice, strikePrice, timeToMaturity, volatility, riskFreeRate } = params;
  
  if (timeToMaturity <= 0 || volatility <= 0 || spotPrice <= 0 || strikePrice <= 0) {
    return {
      delta: { call: 0, put: 0 },
      gamma: 0,
      theta: { call: 0, put: 0 },
      vega: 0,
      rho: { call: 0, put: 0 }
    };
  }

  const { d1, d2 } = calculateD1D2(params);
  const sqrtT = Math.sqrt(timeToMaturity);
  const discountFactor = Math.exp(-riskFreeRate * timeToMaturity);

  // Delta
  const callDelta = normalCDF(d1);
  const putDelta = callDelta - 1;

  // Gamma (same for call and put)
  const gamma = normalPDF(d1) / (spotPrice * volatility * sqrtT);

  // Theta (per year, divide by 365 for daily)
  const term1 = -(spotPrice * normalPDF(d1) * volatility) / (2 * sqrtT);
  const callTheta = term1 - riskFreeRate * strikePrice * discountFactor * normalCDF(d2);
  const putTheta = term1 + riskFreeRate * strikePrice * discountFactor * normalCDF(-d2);

  // Vega (for 1% change in volatility)
  const vega = spotPrice * sqrtT * normalPDF(d1) / 100;

  // Rho (for 1% change in interest rate)
  const callRho = strikePrice * timeToMaturity * discountFactor * normalCDF(d2) / 100;
  const putRho = -strikePrice * timeToMaturity * discountFactor * normalCDF(-d2) / 100;

  return {
    delta: { call: callDelta, put: putDelta },
    gamma,
    theta: { call: callTheta / 365, put: putTheta / 365 }, // Daily theta
    vega,
    rho: { call: callRho, put: putRho }
  };
}

// Generate delta curve data for charting
export function generateDeltaCurve(
  baseParams: BlackScholesParams,
  spotPriceRange: { min: number; max: number; steps: number }
): { spotPrices: number[]; callDeltas: number[]; putDeltas: number[] } {
  const spotPrices: number[] = [];
  const callDeltas: number[] = [];
  const putDeltas: number[] = [];

  const step = (spotPriceRange.max - spotPriceRange.min) / spotPriceRange.steps;

  for (let i = 0; i <= spotPriceRange.steps; i++) {
    const spotPrice = spotPriceRange.min + i * step;
    spotPrices.push(spotPrice);

    const greeks = calculateGreeks({ ...baseParams, spotPrice });
    callDeltas.push(greeks.delta.call);
    putDeltas.push(greeks.delta.put);
  }

  return { spotPrices, callDeltas, putDeltas };
}

// Generate call and put price curve data for charting
export function generateCallPutCurve(
  baseParams: BlackScholesParams,
  spotPriceRange: { min: number; max: number; steps: number }
): { spotPrices: number[]; callPrices: number[]; putPrices: number[] } {
  const spotPrices: number[] = [];
  const callPrices: number[] = [];
  const putPrices: number[] = [];

  const step = (spotPriceRange.max - spotPriceRange.min) / spotPriceRange.steps;

  for (let i = 0; i <= spotPriceRange.steps; i++) {
    const spotPrice = spotPriceRange.min + i * step;
    spotPrices.push(spotPrice);

    const result = calculateBlackScholes({ ...baseParams, spotPrice });
    callPrices.push(result.callPrice);
    putPrices.push(result.putPrice);
  }

  return { spotPrices, callPrices, putPrices };
}
