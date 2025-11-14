import { WorkType } from '@/types';

export const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: 'journal-article', label: 'Journal Article' },
  { value: 'conference-proceeding', label: 'Conference Proceeding' },
  { value: 'paper', label: 'Paper' },
  { value: 'poster', label: 'Poster' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'preprint', label: 'Preprint' },
  { value: 'book', label: 'Book' },
  { value: 'book-chapter', label: 'Book Chapter' },
  { value: 'dataset', label: 'Dataset' },
  { value: 'other', label: 'Other' },
];

export const EMPTY_STATE_TEXT = 'No publications added yet' as const;
