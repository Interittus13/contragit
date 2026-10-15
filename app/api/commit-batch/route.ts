import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/SessionManager';
import { commitJobManager } from '@/lib/services/CommitJobManager';
import { gitHubApiClient } from '@/lib/services/GitHubApiClient';
import { CommitBatchRequest } from '@/lib/types/scheduler';

export async function POST(request: NextRequest) {
  const cookieValue = request.cookies.get(sessionManager.getSessionCookieName())?.value;
  const user = sessionManager.parseUser(cookieValue);

  if (!user || !user.accessToken) {
    return NextResponse.json(
      { success: false, message: 'GitHub sign-in is required.' },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as CommitBatchRequest;

    if (!body || !body.commits || !Array.isArray(body.commits) || body.commits.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid batch payload: commits array is required.' },
        { status: 400 }
      );
    }

    const result = await commitJobManager.executeCommitBatch(user, body, gitHubApiClient);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[ContraGit] Batch execution failure:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process commit batch.' },
      { status: 500 }
    );
  }
}
