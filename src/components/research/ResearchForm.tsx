'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Work, WorkType } from '@/types';

interface ResearchFormProps {
  mode: 'create' | 'edit';
  initialData?: Work & { rkey?: string };
}

const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: 'abstract', label: 'Abstract' },
  { value: 'poster', label: 'Poster' },
  { value: 'paper', label: 'Paper' },
  { value: 'conference-proceeding', label: 'Conference Proceeding' },
  { value: 'journal-article', label: 'Journal Article' },
  { value: 'book-chapter', label: 'Book Chapter' },
  { value: 'book', label: 'Book' },
  { value: 'preprint', label: 'Preprint' },
  { value: 'dataset', label: 'Dataset' },
  { value: 'other', label: 'Other' },
];

export default function ResearchForm({ mode, initialData }: ResearchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resolvingDOI, setResolvingDOI] = useState(false);
  const [error, setError] = useState('');
  const [resolvedMetadata, setResolvedMetadata] = useState<any>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const [formData, setFormData] = useState<{
    doi: string;
    type: WorkType | '';
    rkey?: string;
  }>({
    doi: initialData?.doi || '',
    type: initialData?.type || '',
    rkey: initialData?.rkey,
  });

  const handleResolveDOI = async () => {
    if (!formData.doi) return;

    setResolvingDOI(true);
    setError('');
    setResolvedMetadata(null);

    try {
      const response = await fetch(
        `/api/doi/resolve?doi=${encodeURIComponent(formData.doi)}`
      );

      if (!response.ok) {
        throw new Error('Failed to resolve DOI');
      }

      const data = await response.json();
      setResolvedMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve DOI');
    } finally {
      setResolvingDOI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, bypassDuplicateCheck = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowDuplicateWarning(false);

    try {
      const payload = mode === 'create'
        ? { doi: formData.doi, type: formData.type, bypassDuplicateCheck }
        : { rkey: formData.rkey, type: formData.type };

      const response = await fetch('/api/profile/works', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate error specially
        if (data.error === 'DUPLICATE_DOI' && !bypassDuplicateCheck) {
          setShowDuplicateWarning(true);
          setError(data.message);
          setLoading(false);
          return;
        }
        throw new Error(data.error || `Failed to ${mode} research`);
      }

      router.push('/dashboard/links/research');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleAddDuplicate = (e: React.FormEvent) => {
    handleSubmit(e, true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this research item?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/profile/works?rkey=${encodeURIComponent(formData.rkey || '')}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete research');
      }

      router.push('/dashboard/links/research');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete research');
      setLoading(false);
    }
  };

  return (
    <form id="research-form" onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DOI *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.doi}
              onChange={(e) =>
                setFormData({ ...formData, doi: e.target.value })
              }
              required
              disabled={mode === 'edit'}
              placeholder="10.1234/example"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            {mode === 'create' && (
              <button
                type="button"
                onClick={handleResolveDOI}
                disabled={!formData.doi || resolvingDOI}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
              >
                {resolvingDOI ? 'Resolving...' : 'Resolve'}
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'create'
              ? 'Metadata will be automatically fetched from the DOI'
              : 'DOI cannot be changed after creation'}
          </p>
        </div>

        {resolvedMetadata && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              DOI Resolved Successfully
            </p>
            {resolvedMetadata.title && (
              <p className="text-sm text-blue-800 mb-1">
                <strong>Title:</strong> {resolvedMetadata.title}
              </p>
            )}
            {resolvedMetadata.authors && (
              <p className="text-sm text-blue-800 mb-1">
                <strong>Authors:</strong> {resolvedMetadata.authors.join(', ')}
              </p>
            )}
            {resolvedMetadata.journal && (
              <p className="text-sm text-blue-800 mb-1">
                <strong>Venue:</strong> {resolvedMetadata.journal}
              </p>
            )}
            {resolvedMetadata.publicationDate && (
              <p className="text-sm text-blue-800 mb-1">
                <strong>Published:</strong> {new Date(resolvedMetadata.publicationDate).getFullYear()}
              </p>
            )}
            {resolvedMetadata.abstract && (
              <p className="text-sm text-blue-800 mb-1">
                <strong>Abstract:</strong> {resolvedMetadata.abstract.substring(0, 200)}...
              </p>
            )}
            {resolvedMetadata.url && (
              <p className="text-sm text-blue-800">
                <strong>URL:</strong>{' '}
                <a
                  href={resolvedMetadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  {resolvedMetadata.url}
                </a>
              </p>
            )}
          </div>
        )}

        {mode === 'edit' && initialData && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Work Metadata
            </p>
            {initialData.title && (
              <p className="text-sm text-gray-800 mb-1">
                <strong>Title:</strong> {initialData.title}
              </p>
            )}
            {initialData.authors && initialData.authors.length > 0 && (
              <p className="text-sm text-gray-800 mb-1">
                <strong>Authors:</strong> {initialData.authors.join(', ')}
              </p>
            )}
            {initialData.venue && (
              <p className="text-sm text-gray-800 mb-1">
                <strong>Venue:</strong> {initialData.venue}
              </p>
            )}
            {initialData.publicationDate && (
              <p className="text-sm text-gray-800 mb-1">
                <strong>Published:</strong> {new Date(initialData.publicationDate).getFullYear()}
              </p>
            )}
            {('abstract' in initialData && initialData.abstract && typeof initialData.abstract === 'string') ? (
              <p className="text-sm text-gray-800 mb-1">
                <strong>Abstract:</strong> {initialData.abstract.substring(0, 200)}{initialData.abstract.length > 200 ? '...' : ''}
              </p>
            ) : null}
            {('url' in initialData && initialData.url && typeof initialData.url === 'string') ? (
              <p className="text-sm text-gray-800">
                <strong>URL:</strong>{' '}
                <a
                  href={initialData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-900"
                >
                  {initialData.url}
                </a>
              </p>
            ) : null}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as WorkType })
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select type...</option>
            {WORK_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm mb-2">{error}</p>
          {showDuplicateWarning && (
            <button
              type="button"
              onClick={handleAddDuplicate}
              disabled={loading}
              className="text-sm text-red-700 underline hover:text-red-800 disabled:opacity-50"
            >
              Add anyway
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? mode === 'create'
              ? 'Adding...'
              : 'Saving...'
            : mode === 'create'
            ? 'Add Research'
            : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard/research')}
          disabled={loading}
          className="w-full py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full text-red-600 py-2 hover:text-red-700 disabled:text-gray-400"
          >
            Delete Research
          </button>
        )}
      </div>
    </form>
  );
}
