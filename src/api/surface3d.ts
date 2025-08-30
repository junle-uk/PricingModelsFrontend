export interface Surface3DRequest {
  spotPrice: number;
  strikePrice: number;
  timeToMaturity: number;
  volatility: number;
  riskFreeRate: number;
  spotMin: number;
  spotMax: number;
  timeMin: number;
  timeMax: number;
  spotSteps?: number;
  timeSteps?: number;
  model: "black-scholes" | "binomial" | "monte-carlo";
  steps?: number;
  simulations?: number;
}

export interface Surface3DResponse {
  spotPrices: number[];
  times: number[];
  callPrices: number[][];
  putPrices: number[][];
}

export async function fetchSurface3D(
  request: Surface3DRequest
): Promise<Surface3DResponse> {
  const res = await fetch("/dataFetchers/surface-3d", {
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

