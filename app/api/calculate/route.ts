import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/SessionManager';
import { scheduleEngine } from '@/lib/services/ScheduleEngine';

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
    const calculation = scheduleEngine.calculate({
      ...body,
      repoOwner: body.repoOwner || user.login,
    });

    return NextResponse.json({
      success: true,
      ...calculation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Schedule calculation failed' },
      { status: 400 }
    );
  }
}
