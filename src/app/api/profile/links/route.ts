import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';

export async function POST(request: NextRequest) {
  try {
    const agent = await getAgent();

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const link = await request.json();

    const repo = new ProfileRepository(agent);
    const rkey = await repo.createWebLink(link);

    return NextResponse.json({ success: true, rkey });
  } catch (error) {
    console.error('Error adding link:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to add link';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const agent = await getAgent();

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rkey = searchParams.get('rkey');

    if (!rkey) {
      return NextResponse.json({ error: 'rkey is required' }, { status: 400 });
    }

    const updates = await request.json();

    const repo = new ProfileRepository(agent);
    await repo.updateWebLink(rkey, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const agent = await getAgent();

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rkey = searchParams.get('rkey');

    if (!rkey) {
      return NextResponse.json({ error: 'rkey is required' }, { status: 400 });
    }

    const repo = new ProfileRepository(agent);
    await repo.deleteWebLink(rkey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
