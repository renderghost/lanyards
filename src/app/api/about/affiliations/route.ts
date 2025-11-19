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
    const {
      organizationName,
      organizationType,
      role,
      startDate,
      endDate,
      isPrimary,
      website,
      location,
    } = body;

    if (!organizationName || !startDate) {
      return NextResponse.json(
        { error: 'Organization name and start date are required' },
        { status: 400 }
      );
    }

    const repo = new ProfileRepository(agent);
    const rkey = await repo.createAffiliation({
      organizationName,
      organizationType: organizationType || 'institution',
      role,
      startDate,
      endDate,
      isPrimary: isPrimary || false,
      website,
      location,
    });

    return NextResponse.json({ success: true, rkey });
  } catch (error) {
    console.error('Error creating affiliation:', error);
    return NextResponse.json(
      { error: 'Failed to create affiliation' },
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
    const {
      organizationName,
      organizationType,
      role,
      startDate,
      endDate,
      isPrimary,
      website,
      location,
    } = body;

    if (!organizationName || !startDate) {
      return NextResponse.json(
        { error: 'Organization name and start date are required' },
        { status: 400 }
      );
    }

    const repo = new ProfileRepository(agent);
    await repo.updateAffiliation(rkey, {
      organizationName,
      organizationType: organizationType || 'institution',
      role,
      startDate,
      endDate,
      isPrimary: isPrimary || false,
      website,
      location,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating affiliation:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliation' },
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
    await repo.deleteAffiliation(rkey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting affiliation:', error);
    return NextResponse.json(
      { error: 'Failed to delete affiliation' },
      { status: 500 }
    );
  }
}
