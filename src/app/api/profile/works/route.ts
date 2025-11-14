import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import { resolveDOI } from '@/lib/data/doi';

export async function POST(request: NextRequest) {
  try {
    const agent = await getAgent();

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doi, type, bypassDuplicateCheck } = await request.json();

    const repo = new ProfileRepository(agent);

    // Check for duplicates unless explicitly bypassed
    if (!bypassDuplicateCheck) {
      const existingWorks = await repo.listWorks(agent.session?.did || '');
      const duplicate = existingWorks.find((w) => w.doi === doi);

      if (duplicate) {
        return NextResponse.json(
          {
            error: 'DUPLICATE_DOI',
            message: 'This DOI has already been added to your research.',
          },
          { status: 409 }
        );
      }
    }

    // Resolve DOI metadata
    const metadata = await resolveDOI(doi);

    const work = {
      doi,
      type,
      title: metadata?.title,
      authors: metadata?.authors,
      publicationDate: metadata?.publicationDate,
      venue: metadata?.journal,
      abstract: metadata?.abstract,
      url: metadata?.url,
    };

    const rkey = await repo.createWork(work);

    return NextResponse.json({ success: true, rkey });
  } catch (error) {
    console.error('Error adding work:', error);
    return NextResponse.json(
      { error: 'Failed to add work' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const agent = await getAgent();

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rkey, type } = await request.json();

    if (!rkey) {
      return NextResponse.json({ error: 'rkey is required' }, { status: 400 });
    }

    const repo = new ProfileRepository(agent);
    await repo.updateWork(rkey, { type });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating work:', error);
    return NextResponse.json(
      { error: 'Failed to update work' },
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
    await repo.deleteWork(rkey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work:', error);
    return NextResponse.json(
      { error: 'Failed to delete work' },
      { status: 500 }
    );
  }
}
