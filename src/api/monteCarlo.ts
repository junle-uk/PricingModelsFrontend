export interface MonteCarloParams {
  spotPrice: number;
  strikePrice: number;
  timeToMaturity: number;
  volatility: number;
  riskFreeRate: number;
  simulations?: number;
}

export interface MonteCarloResult {
  callPrice: number;
  putPrice: number;
}

export async function fetchMonteCarlo(
  params: MonteCarloParams
): Promise<MonteCarloResult> {
  const res = await fetch("/dataFetchers/monte-carlo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  
  return res.json();
}

