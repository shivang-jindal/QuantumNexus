const pageUrl = 'https://csrc.nist.gov/projects/post-quantum-cryptography/news';

/** Small, bounded reader for NIST's public PQC news page. Links are restricted to NIST. */
export async function fetchNistPqcUpdates() {
  let response: Response;
  try { response = await fetch(pageUrl, { signal: AbortSignal.timeout(12_000), redirect: 'error', headers: { accept: 'text/html' } }); }
  catch (error) { throw Object.assign(new Error(error instanceof Error && error.name === 'TimeoutError' ? 'NIST update request timed out.' : 'NIST updates could not be reached.'), { statusCode: 503, code: 'NIST_UNAVAILABLE' }); }
  if (!response.ok) throw Object.assign(new Error(`NIST returned HTTP ${response.status}.`), { statusCode: 502, code: 'NIST_PROVIDER_ERROR' });
  const html = await response.text();
  if (html.length > 3_000_000) throw Object.assign(new Error('NIST page exceeded the 3 MB safety limit.'), { statusCode: 502, code: 'NIST_RESPONSE_TOO_LARGE' });
  const section = html.split(/News and Updates/i)[1]?.split(/Project Links/i)[0] ?? '';
  const updates = [...section.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].slice(0, 12).flatMap((match) => {
    const href = match[1] ?? '';
    const title = (match[2] ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (!title || !href) return [];
    let url: URL;
    try { url = new URL(href, pageUrl); } catch { return []; }
    if (url.hostname !== 'csrc.nist.gov') return [];
    const tail = section.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 500);
    const date = tail.match(/(?:<time[^>]*>)?\s*([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i)?.[1] ?? null;
    const summary = tail.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().slice(0, 280);
    return [{ title, date, summary, url: url.toString() }];
  });
  if (!updates.length) throw Object.assign(new Error('NIST page format changed; updates could not be safely extracted.'), { statusCode: 502, code: 'NIST_INVALID_RESPONSE' });
  return { updates, fetchedAt: new Date().toISOString(), source: { name: 'NIST CSRC Post-Quantum Cryptography news', url: pageUrl }, note: 'Official publication updates; opening a source is recommended before making migration or compliance decisions.' };
}
