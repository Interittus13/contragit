import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/SessionManager';
import { gitHubApiClient } from '@/lib/services/GitHubApiClient';

export async function POST(request: NextRequest) {
  const cookieValue = request.cookies.get(sessionManager.getSessionCookieName())?.value;
  const user = sessionManager.parseUser(cookieValue);

  if (!user || !user.accessToken) {
    return NextResponse.json(
      { success: false, message: 'GitHub sign-in is required.' },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const owner = String(body.repoOwner || user.login).trim();
  const repo = String(body.repoName || '').trim();

  if (!owner || !repo) {
    return NextResponse.json(
      { success: false, message: 'Repository owner and name are required.' },
      { status: 400 }
    );
  }

  try {
    const result = await gitHubApiClient.validateRepository(owner, repo, user.accessToken);
    return NextResponse.json({
      success: true,
      valid: result.valid,
      exists: result.exists,
      canPush: result.canPush,
      defaultBranch: result.defaultBranch,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Validation failed' },
      { status: error.status || 500 }
    );
  }
}
