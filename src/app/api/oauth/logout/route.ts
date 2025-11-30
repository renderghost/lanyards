import { NextResponse } from 'next/server';

import { deleteSession } from '@/lib/oauth/session';

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout failed:', err);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
