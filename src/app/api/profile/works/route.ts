import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/auth/atproto';
import { getSession } from '@/lib/auth/session';
import { ProfileRepository } from '@/lib/data/repository';
import { resolveDOI, normalizeDOI } from '@/lib/data/doi';

export async function POST(request: NextRequest) {
  try {
    const agent = await getAgent();
    const session = await getSession();

    if (!agent || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doi: rawDoi, bypassDuplicateCheck } = await request.json();

    // Normalize DOI to plain format (e.g., "10.1234/example")
    // This ensures we never store URLs, only the canonical DOI identifier
    const doi = normalizeDOI(rawDoi);

    const repo = new ProfileRepository(agent);

    // Check for duplicates unless explicitly bypassed
    if (!bypassDuplicateCheck) {
      const existingWorks = await repo.listWorks(session.did);
      // Compare normalized DOIs to catch duplicates even if entered in different formats
      const duplicate = existingWorks.find((w) => normalizeDOI(w.doi) === doi);

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
      type: metadata?.type || 'other',
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

export async function PUT(_request: NextRequest) {
  // Works are immutable - DOI and type come from CrossRef metadata
  // This endpoint is kept for future extensibility
  return NextResponse.json(
    { error: 'Works cannot be updated. Delete and re-add instead.' },
    { status: 400 }
  );
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
