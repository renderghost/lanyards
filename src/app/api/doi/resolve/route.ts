import { NextRequest, NextResponse } from 'next/server';
import { resolveDOI } from '@/lib/data/doi';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doi = searchParams.get('doi');

    if (!doi) {
      return NextResponse.json({ error: 'DOI is required' }, { status: 400 });
    }

    const metadata = await resolveDOI(doi);

    if (!metadata) {
      return NextResponse.json(
        { error: 'Failed to resolve DOI' },
        { status: 404 }
      );
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error resolving DOI:', error);
    return NextResponse.json(
      { error: 'Failed to resolve DOI' },
      { status: 500 }
    );
  }
}
