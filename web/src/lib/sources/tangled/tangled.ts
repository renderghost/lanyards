import type { Did, Handle } from '@atcute/lexicons';

import { profileId } from '@/lib/atproto/profileId';
import { TANGLED_APPVIEW } from '@/lib/atproto/endpoints';
import { listRecords } from '@/lib/atproto/pds';
import { validateRecord } from '@/lib/lexicons/validate';
import { requestJson } from '@/lib/sources/request';
import { err, ok, type Result } from '@/lib/sources/result';

import type { CodeRepo } from './tangled.types';

const DECLARATION_LIMIT = 100;

type Manifest = {
  declaration: { name: string; owner: string };
  description?: string;
  createdAt: string;
};

const repoUrl = (did: Did, handle: string, name: string) =>
  `https://tangled.org/${profileId(did, handle)}/${encodeURIComponent(name)}`;

const newestFirst = (a: CodeRepo, b: CodeRepo) =>
  (b.createdAt ?? '').localeCompare(a.createdAt ?? '');

async function fromAppView(
  did: Did,
  handle: string,
  signal?: AbortSignal
): Promise<Result<CodeRepo[]>> {
  const url = `${TANGLED_APPVIEW}/xrpc/org.tangled.repo.listRepos?${new URLSearchParams({ subject: did })}`;
  const response = await requestJson('tangled', url, signal);
  if (!response.ok) return response;
  const items = (response.value as { items?: unknown }).items;
  if (!Array.isArray(items)) return err('tangled', 'invalid');
  return ok(
    items.flatMap((item: { uri?: unknown; value?: unknown }) => {
      const result = validateRecord('org.tangled.repo.manifest', item.value);
      if (!result.ok || typeof item.uri !== 'string') return [];
      const manifest = result.value as Manifest;
      if (manifest.declaration.owner !== did) return [];
      return [
        {
          key: item.uri,
          name: manifest.declaration.name,
          ...(manifest.description
            ? { description: manifest.description }
            : {}),
          url: repoUrl(did, handle, manifest.declaration.name),
          createdAt: manifest.createdAt,
        },
      ];
    })
  );
}

/** Names only: declarations carry no description. */
async function fromDeclarations(
  did: Did,
  handle: string,
  signal?: AbortSignal
): Promise<Result<CodeRepo[]>> {
  const records = await listRecords(
    'tangled',
    did,
    'org.tangled.repo.declaration',
    { limit: DECLARATION_LIMIT, signal }
  );
  if (!records.ok) return records;
  return ok(
    records.value.flatMap((record) => {
      const result = validateRecord(
        'org.tangled.repo.declaration',
        record.value
      );
      if (!result.ok) return [];
      const name = record.uri.split('/').pop() ?? '';
      const { createdAt } = result.value as { createdAt: string };
      return name
        ? [
            {
              key: record.uri,
              name,
              url: repoUrl(did, handle, name),
              createdAt,
            },
          ]
        : [];
    })
  );
}

/** The person's Tangled repositories, newest first. */
export async function fetchRepos(
  did: Did,
  handle: Handle | string,
  limit: number,
  signal?: AbortSignal
): Promise<Result<CodeRepo[]>> {
  let repos = await fromAppView(did, handle, signal);
  if (!repos.ok) repos = await fromDeclarations(did, handle, signal);
  if (!repos.ok) return repos;
  return ok([...repos.value].sort(newestFirst).slice(0, limit));
}
