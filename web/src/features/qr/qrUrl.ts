import type { Did } from '@atcute/lexicons';

/**
 * What the QR code opens: the owner's lanyard by DID, which survives a
 * handle change, on this deployment (spec §7.6).
 */
export function qrUrl(did: Did): string {
  return `${import.meta.env.VITE_PUBLIC_BASE_URL}/d/${did}`;
}
