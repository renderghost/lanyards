import { NextResponse } from 'next/server';
import { getAuthMethod } from '@/lib/auth/config';

export async function GET() {
  return NextResponse.json({
    method: getAuthMethod(),
  });
}
