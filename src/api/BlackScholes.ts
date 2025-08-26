const API_BASE = "http://127.0.0.1:8000";

export interface BlackScholesParams {
  spotPrice: number;
  strikePrice: number;
  timeToMaturity: number;
  volatility: number;
  riskFreeRate: number;
}

export interface BlackScholesResult {
  callPrice: number;
  putPrice: number;
  d1: number;
  d2: number;
}

export async function fetchRoot() {
  const res = await fetch(`${API_BASE}/`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchBlackScholes(
  params: BlackScholesParams
): Promise<BlackScholesResult> {
  const res = await fetch(`${API_BASE}/api/black-scholes`, {
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