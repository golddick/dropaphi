// // lib/cors.ts
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, drop-api-key, Authorization",
//   "Access-Control-Max-Age": "86400",
// }

// export function handleCORS(request: NextRequest) {
//   // Handle preflight requests
//   if (request.method === 'OPTIONS') {
//     return new NextResponse(null, {
//       status: 204,
//       headers: corsHeaders,
//     })
//   }
//   return null
// }

// export function addCORSHeaders(response: NextResponse) {
//   Object.entries(corsHeaders).forEach(([key, value]) => {
//     response.headers.set(key, value)
//   })
//   return response
// }




// lib/cors.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, drop-api-key,DROP-API-Key, Authorization, Accept",
  "Access-Control-Max-Age": "86400",
}

export function handleCORS(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200, 
      headers: corsHeaders,
    })
  }
  return null
}

export function addCORSHeaders(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}