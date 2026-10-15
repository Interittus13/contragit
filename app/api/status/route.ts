import { NextRequest, NextResponse } from 'next/server';
import { commitJobManager } from '@/lib/services/CommitJobManager';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { success: false, message: 'Missing jobId parameter' },
      { status: 400 }
    );
  }

  const job = commitJobManager.getJob(jobId);
  if (!job) {
    return NextResponse.json(
      { success: false, message: 'Job not found or expired.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    job,
  });
}
