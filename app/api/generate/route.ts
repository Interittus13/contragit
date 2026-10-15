import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/SessionManager';
import { scheduleEngine } from '@/lib/services/ScheduleEngine';
import { commitJobManager } from '@/lib/services/CommitJobManager';
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

  try {
    const body = await request.json();
    const config = {
      ...body,
      repoOwner: body.repoOwner || user.login,
      repoName: body.repoName || 'gitcontra',
    };

    const timestamps = scheduleEngine.generateCommitTimestamps(config);

    if (timestamps.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No eligible commits found in the selected date range and weekday configuration.' },
        { status: 400 }
      );
    }

    const job = commitJobManager.createJob(user, config, timestamps.length);

    // Run execution asynchronously
    commitJobManager.executeJob(job.id, user, config, timestamps, gitHubApiClient).catch(err => {
      console.error('[ContraGit] Job execution error:', err);
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      totalCommits: timestamps.length,
      message: 'Job started successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to start generation job.' },
      { status: 500 }
    );
  }
}
