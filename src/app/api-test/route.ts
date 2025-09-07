import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "This is a simple test route in /app/api-test",
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    status: "ok", 
    message: "This is a simple test route in /app/api-test (POST)",
    timestamp: new Date().toISOString()
  });
}

