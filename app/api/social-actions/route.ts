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
  const action = String(body.action || '').toLowerCase();
  const repoOwner = String(body.repoOwner || process.env.REPO_OWNER || 'Interittus13').trim();
  const repoName = String(body.repoName || process.env.REPO_NAME || 'gitcontra').trim();
  const followUser = String(body.followUser || process.env.GITHUB_FOLLOW_USER || 'Interittus13').trim();

  try {
    if (action === 'star') {
      await gitHubApiClient.starRepository(repoOwner, repoName, user.accessToken);
      return NextResponse.json({
        success: true,
        message: `Starred ${repoOwner}/${repoName} successfully! Thank you for supporting ContraGit.`,
      });
    }

    if (action === 'follow') {
      if (followUser.toLowerCase() === user.login.toLowerCase()) {
        return NextResponse.json({
          success: true,
          message: 'You are the maintainer, no follow needed!',
        });
      }

      await gitHubApiClient.followUser(followUser, user.accessToken);
      return NextResponse.json({
        success: true,
        message: `Followed ${followUser} successfully!`,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action. Supported: star, follow.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Social action failed.' },
      { status: error.status || 500 }
    );
  }
}
