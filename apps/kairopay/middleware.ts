import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get("origin");
  
  // Allow requests from localhost:3000 (dashboard) and localhost:3001
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ];
  
  const defaultOrigin = "http://localhost:3000";
  
  // Determine which origin to allow
  let allowOrigin: string = defaultOrigin;
  if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  }

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Handle actual request
  const response = NextResponse.next();
  
  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  
  return response;
}

// Apply middleware to API routes only
export const config = {
  matcher: "/api/:path*",
};

