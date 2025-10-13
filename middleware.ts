import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest): NextResponse {
  // Get token (supports multiple methods)
  const token = request.headers.get('API_TOKEN')

  // Check if token exists
  if (!token) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message:
          'No token provided. Please provide a token via Authorization header, x-api-key header, or token cookie.',
      },
      { status: 401 }
    )
  }

  // Verify token (using API_TOKEN from environment variables)
  // You can modify this to JWT verification or other authentication methods as needed
  const validToken = process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN

  if (token !== validToken) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Invalid token provided.',
      },
      { status: 401 }
    )
  }

  // Token verification passed, allow request to continue
  // You can add additional information to request headers here
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-authenticated', 'true')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Configure paths that need to go through middleware
// This matches all /*/mcp/* paths (arxiv/mcp, games/mcp, news/mcp, etc.)
export const config: { matcher: string[] } = {
  matcher: [
    '/arxiv/mcp/:path*',
    '/games/mcp/:path*',
    '/news/mcp/:path*',
    // If you need to match more paths, add them here
    // '/api/:path*',
  ],
}
