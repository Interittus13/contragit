import { NextResponse } from 'next/server';
import { oAuthService } from '@/lib/services/OAuthService';

export async function GET() {
  const configured = oAuthService.isConfigured();
  const missing = oAuthService.getMissingConfig();

  return NextResponse.json({
    success: true,
    configured,
    missing,
  });
}
