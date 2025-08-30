export interface GreeksCurveRequest {
  spotPrice: number;
  strikePrice: number;
  timeToMaturity: number;
  volatility: number;
  riskFreeRate: number;
  rangeMin: number;
  rangeMax: number;
  steps: number;
  curveType: "gamma" | "vega" | "theta";
}

export interface GreeksCurveResponse {
  xValues: number[];
  yValues: number[];
}

export async function fetchGreeksCurve(
  request: GreeksCurveRequest
): Promise<GreeksCurveResponse> {
  const res = await fetch("/dataFetchers/greeks-curve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  
  return res.json();
}

