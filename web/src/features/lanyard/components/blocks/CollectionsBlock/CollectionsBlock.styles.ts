import { meta } from '../shared.styles';

export { item, list, meta, title } from '../shared.styles';

/** A long description stops after three lines. */
export const description = `${meta} line-clamp-3`;

export const links = 'flex flex-col gap-1 border-l-2 border-border pl-3';

export const link = 'text-sm leading-5 [overflow-wrap:anywhere]';
