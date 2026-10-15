import { NextRequest, NextResponse } from 'next/server';
import { oAuthService } from '@/lib/services/OAuthService';
import { gitHubApiClient } from '@/lib/services/GitHubApiClient';
import { sessionManager } from '@/lib/services/SessionManager';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');
  const returnedState = url.searchParams.get('state');
  const expectedState = request.cookies.get(sessionManager.getStateCookieName())?.value;

  if (errorParam) {
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(errorParam)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=Missing+GitHub+OAuth+code', request.url));
  }

  if (!expectedState || !returnedState || expectedState !== returnedState) {
    return NextResponse.redirect(new URL('/auth?error=Invalid+OAuth+state.+Please+try+again', request.url));
  }

  try {
    const accessToken = await oAuthService.exchangeCodeForToken(code);
    const user = await gitHubApiClient.getAuthenticatedUser(accessToken);

    const serialized = sessionManager.serializeUser(user);
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    response.cookies.set(sessionManager.getSessionCookieName(), serialized, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionManager.getMaxAge(),
    });

    response.cookies.delete(sessionManager.getStateCookieName());

    return response;
  } catch (error: any) {
    const msg = error.message || 'Authentication failed';
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(msg)}`, request.url));
  }
}
