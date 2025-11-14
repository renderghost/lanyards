import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';

export async function POST(request: NextRequest) {
  try {
    const agent = await getAgent();

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const affiliation = await request.json();

    const repo = new ProfileRepository(agent);
    const rkey = await repo.createAffiliation(affiliation);

    return NextResponse.json({ success: true, rkey });
  } catch (error) {
    console.error('Error adding affiliation:', error);
    return NextResponse.json(
      { error: 'Failed to add affiliation' },
      { status: 500 }
    );
  }
}
