"use client";

import { useState } from "react";

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGet = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("/dataFetchers/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(`Error ${res.status}: ${JSON.stringify(data)}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const testSimpleRoute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("/api-test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(`Error ${res.status}: ${JSON.stringify(data)}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const testPost = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("/dataFetchers/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: "data" }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(`Error ${res.status}: ${JSON.stringify(data)}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const testBackendDirect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await fetch("http://localhost:8000/api/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(`Error ${res.status}: ${JSON.stringify(data)}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-green-400 font-mono p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={testGet}
              disabled={loading}
              className="px-4 py-2 border border-green-400 bg-black text-green-400 hover:bg-green-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test GET /dataFetchers/test
            </button>
            
            <button
              onClick={testPost}
              disabled={loading}
              className="px-4 py-2 border border-green-400 bg-black text-green-400 hover:bg-green-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test POST /dataFetchers/test
            </button>
            
            <button
              onClick={testBackendDirect}
              disabled={loading}
              className="px-4 py-2 border border-yellow-400 bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test Backend Direct (localhost:8000)
            </button>
            
            <button
              onClick={testSimpleRoute}
              disabled={loading}
              className="px-4 py-2 border border-blue-400 bg-black text-blue-400 hover:bg-blue-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test Simple Route (/api-test)
            </button>
          </div>

          {loading && (
            <div className="text-yellow-400">Loading...</div>
          )}

          {error && (
            <div className="p-4 border border-red-400 bg-red-900/20 text-red-400">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="p-4 border border-green-400 bg-green-900/20">
              <strong>Success:</strong>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 border border-blue-400 bg-blue-900/20 text-blue-400">
            <h2 className="font-bold mb-2">Test Information:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>GET /dataFetchers/test - Tests the Next.js route handler (GET)</li>
              <li>POST /dataFetchers/test - Tests the Next.js route handler (POST)</li>
              <li>Test Backend Direct - Tests direct connection to Python backend</li>
              <li>Test Simple Route - Tests a simple route at /api-test (no backend proxy)</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 border border-yellow-400 bg-yellow-900/20 text-yellow-400">
            <h2 className="font-bold mb-2">⚠️ Troubleshooting:</h2>
            <p className="text-sm mb-2">If all routes return 404, try:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Stop your Next.js dev server (Ctrl+C)</li>
              <li>Clear the cache: <code className="bg-black px-1">cd frontend && Remove-Item -Recurse -Force .next</code></li>
              <li>Restart: <code className="bg-black px-1">npm run dev</code></li>
              <li>Verify backend is running on port 8000</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

