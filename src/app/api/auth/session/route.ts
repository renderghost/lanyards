import { NextResponse } from 'next/server';
import { getSessionDid, deleteSession } from '@/lib/oauth/session';

export async function GET() {
  try {
    const did = await getSessionDid();

    if (!did) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      did,
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve session',
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to delete session',
      },
      { status: 500 }
    );
  }
}
