import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/SessionManager';
import { gitHubApiClient } from '@/lib/services/GitHubApiClient';

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(sessionManager.getSessionCookieName())?.value;
  const user = sessionManager.parseUser(cookieValue);

  if (!user || !user.accessToken) {
    return NextResponse.json(
      { success: false, message: 'GitHub sign-in is required.' },
      { status: 401 }
    );
  }

  try {
    const repos = await gitHubApiClient.listUserRepositories(user.accessToken);
    return NextResponse.json({ success: true, repos });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch repositories' },
      { status: error.status || 500 }
    );
  }
}
