/**
 * DOI resolution utilities
 * Fetches metadata from CrossRef and DataCite
 */

/**
 * Strip JATS XML tags from text
 * JATS (Journal Article Tag Suite) is commonly used in academic abstracts
 */
function stripJATSTags(text: string): string {
  if (!text) return text;

  // Remove all XML/HTML tags
  return text.replace(/<[^>]*>/g, '').trim();
}

export interface DOIMetadata {
  title?: string;
  authors?: string[];
  publicationDate?: string;
  journal?: string;
  type?: string;
  abstract?: string;
  url?: string;
}

export async function resolveDOI(doi: string): Promise<DOIMetadata | null> {
  try {
    // Clean DOI
    const cleanDOI = doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');

    // Try CrossRef first
    const response = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(cleanDOI)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const work = data.message;

    return {
      title: work.title?.[0],
      authors: work.author?.map(
        (a: { given?: string; family?: string }) =>
          `${a.given || ''} ${a.family || ''}`.trim()
      ),
      publicationDate: work.published?.['date-parts']?.[0]?.join('-'),
      journal:
        work['container-title']?.[0] || work.publisher || work.institution,
      type: work.type,
      abstract: work.abstract ? stripJATSTags(work.abstract) : undefined,
      url: work.URL,
    };
  } catch (error) {
    console.error('Error resolving DOI:', error);
    return null;
  }
}
