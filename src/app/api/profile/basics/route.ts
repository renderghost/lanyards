import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';

export async function PUT(request: NextRequest) {
  try {
    const agent = await getAgent();

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { honorific, location } = body;

    const repo = new ProfileRepository(agent);

    // Update honorific if provided
    if (honorific !== undefined) {
      await repo.setHonorific({ value: honorific });
    }

    // Update location if provided
    if (location !== undefined) {
      await repo.setLocation(location);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating basics:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
