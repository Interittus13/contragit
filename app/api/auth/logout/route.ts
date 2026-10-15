import { NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/SessionManager';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Signed out.' });
  response.cookies.delete(sessionManager.getSessionCookieName());
  return response;
}
