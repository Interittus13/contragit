import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/SessionManager';
import { gitHubApiClient } from '@/lib/services/GitHubApiClient';

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(sessionManager.getSessionCookieName())?.value;
  const user = sessionManager.parseUser(cookieValue);

  if (!user || !user.login) {
    return NextResponse.json(
      { success: false, message: 'GitHub sign-in is required.' },
      { status: 401 }
    );
  }

  try {
    const contributions = await gitHubApiClient.fetchContributionCalendar(
      user.login,
      user.accessToken
    );

    return NextResponse.json({
      success: true,
      user: user.login,
      contributions,
      totalActiveDays: Object.keys(contributions).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch contribution calendar' },
      { status: error.status || 500 }
    );
  }
}
