import { NextRequest, NextResponse } from 'next/server';
import { oAuthService } from '@/lib/services/OAuthService';
import { sessionManager } from '@/lib/services/SessionManager';

export async function GET(request: NextRequest) {
  if (!oAuthService.isConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
      },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  const protocol = request.headers.get('x-forwarded-proto') || (url.protocol.replace(':', '')) || 'http';
  const callbackUrl = `${protocol}://${host}/api/auth/callback`;

  const state = oAuthService.generateState();
  const authUrl = oAuthService.getAuthorizationUrl(callbackUrl, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(sessionManager.getStateCookieName(), state, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
  });

  return response;
}
