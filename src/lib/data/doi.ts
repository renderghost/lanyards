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

/**
 * Normalize a DOI to its canonical form (e.g., "10.1234/example")
 *
 * Supported input formats:
 * - Plain DOI: 10.1234/example
 * - With doi: prefix: doi:10.1234/example
 * - HTTPS doi.org: https://doi.org/10.1234/example
 * - HTTP doi.org: http://doi.org/10.1234/example
 * - With www: https://www.doi.org/10.1234/example
 * - dx.doi.org: https://dx.doi.org/10.1234/example
 * - Handle.net: https://hdl.handle.net/10.1234/example
 * - dx.hdl.handle.net: https://dx.hdl.handle.net/10.1234/example
 * - URL with doi: prefix: https://doi.org/doi:10.1234/example
 *
 * @param input - DOI in any supported format
 * @returns Normalized DOI starting with "10." or the original input if not recognized
 */
export function normalizeDOI(input: string): string {
  if (!input) return input;

  let doi = input.trim();

  // Remove URL prefixes (http/https, www, dx subdomain, various hosts)
  // Handles: doi.org, dx.doi.org, www.doi.org, hdl.handle.net, dx.hdl.handle.net
  doi = doi.replace(
    /^https?:\/\/(?:www\.)?(?:(?:dx\.)?doi\.org|(?:dx\.)?hdl\.handle\.net)\//i,
    ''
  );

  // Remove doi: prefix (may appear after URL stripping or standalone)
  doi = doi.replace(/^doi:/i, '');

  return doi.trim();
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
    // Clean DOI using normalizeDOI for comprehensive format support
    const cleanDOI = normalizeDOI(doi);

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
