import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';

function validateORCID(url: string): boolean {
  // ORCID URLs must be in format: https://orcid.org/0000-0000-0000-0000
  // where each 0 can be any digit, and last digit can be 0-9 or X
  const orcidPattern = /^https:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  return orcidPattern.test(url);
}

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
    const { platform, url } = body;

    if (!platform || !url) {
      return NextResponse.json(
        { error: 'Platform and URL are required' },
        { status: 400 }
      );
    }

    // Validate ORCID URL format
    if (platform === 'orcid' && !validateORCID(url)) {
      return NextResponse.json(
        { error: 'Invalid ORCID URL format. Must be: https://orcid.org/0000-0000-0000-0000' },
        { status: 400 }
      );
    }

    const repo = new ProfileRepository(agent);
    const rkey = await repo.createSocialLink({
      platform,
      url,
      isLocked: false,
    });

    return NextResponse.json({ success: true, rkey });
  } catch (error) {
    console.error('Error creating social link:', error);
    return NextResponse.json(
      { error: 'Failed to create social link' },
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
      return NextResponse.json({ error: 'rkey is required' }, { status: 400 });
    }

    const body = await request.json();
    const { platform, url } = body;

    if (!platform || !url) {
      return NextResponse.json(
        { error: 'Platform and URL are required' },
        { status: 400 }
      );
    }

    // Validate ORCID URL format
    if (platform === 'orcid' && !validateORCID(url)) {
      return NextResponse.json(
        { error: 'Invalid ORCID URL format. Must be: https://orcid.org/0000-0000-0000-0000' },
        { status: 400 }
      );
    }

    const repo = new ProfileRepository(agent);
    await repo.updateSocialLink(rkey, {
      platform,
      url,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating social link:', error);
    return NextResponse.json(
      { error: 'Failed to update social link' },
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
      return NextResponse.json({ error: 'rkey is required' }, { status: 400 });
    }

    const repo = new ProfileRepository(agent);
    await repo.deleteSocialLink(rkey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social link:', error);
    return NextResponse.json(
      { error: 'Failed to delete social link' },
      { status: 500 }
    );
  }
}
