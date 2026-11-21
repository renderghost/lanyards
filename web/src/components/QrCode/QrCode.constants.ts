/** Modules of white around the code, which scanners need (spec §7.6). */
export const QUIET_ZONE = 4;

/** Always dark on light, even in dark mode, for scanner reliability. */
export const LIGHT = '#ffffff';
export const DARK = '#000000';

/**
 * How much of the code's width a centre picture covers (#169). Level H
 * error correction recovers it; the QrCode test scans a code with this
 * much blanked out.
 */
export const CENTRE_SHARE = 0.22;
