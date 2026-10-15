import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/SessionManager';

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(sessionManager.getSessionCookieName())?.value;
  const user = sessionManager.parseUser(cookieValue);

  if (!user || !user.accessToken) {
    return NextResponse.json(
      { success: false, message: 'GitHub sign-in is required.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      login: user.login,
      id: user.id,
      email: user.email,
    },
  });
}
