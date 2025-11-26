import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await getAgent();
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, institution, field, yearAwarded, location } = body;

    if (!title || !type || !institution || !yearAwarded) {
      return NextResponse.json(
        { error: 'Title, type, institution, and year awarded are required' },
        { status: 400 }
      );
    }

    const repo = new ProfileRepository(agent);
    const rkey = await repo.createQualification({
      title,
      type,
      institution,
      field,
      yearAwarded,
      location,
    });

    return NextResponse.json({ success: true, rkey });
  } catch (error) {
    console.error('Error creating qualification:', error);
    return NextResponse.json(
      { error: 'Failed to create qualification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await getAgent();
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rkey = searchParams.get('rkey');

    if (!rkey) {
      return NextResponse.json(
        { error: 'Record key is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, type, institution, field, yearAwarded, location } = body;

    if (!title || !type || !institution || !yearAwarded) {
      return NextResponse.json(
        { error: 'Title, type, institution, and year awarded are required' },
        { status: 400 }
      );
    }

    const repo = new ProfileRepository(agent);
    await repo.updateQualification(rkey, {
      title,
      type,
      institution,
      field,
      yearAwarded,
      location,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating qualification:', error);
    return NextResponse.json(
      { error: 'Failed to update qualification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await getAgent();
    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rkey = searchParams.get('rkey');

    if (!rkey) {
      return NextResponse.json(
        { error: 'Record key is required' },
        { status: 400 }
      );
    }

    const repo = new ProfileRepository(agent);
    await repo.deleteQualification(rkey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting qualification:', error);
    return NextResponse.json(
      { error: 'Failed to delete qualification' },
      { status: 500 }
    );
  }
}
