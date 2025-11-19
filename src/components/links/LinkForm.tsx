'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LinkWeb } from '@/types';

interface LinkFormProps {
  mode: 'create' | 'edit';
  initialData?: LinkWeb & { rkey?: string };
}

export default function LinkForm({
  mode,
  initialData,
}: LinkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    url: initialData?.url || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    rkey: initialData?.rkey,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'create'
        ? '/api/profile/links'
        : `/api/profile/links?rkey=${encodeURIComponent(formData.rkey || '')}`;

      const payload = {
        url: formData.url,
        title: formData.title || undefined,
        description: formData.description || undefined,
      };

      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${mode} link`);
      }

      router.push('/dashboard/links/web');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/profile/links?rkey=${encodeURIComponent(formData.rkey || '')}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete link');
      }

      router.push('/dashboard/links/web');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL *
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g., Personal Website"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Display name for this link
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Brief description of what this link points to"
            maxLength={300}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Optional description (max 300 characters)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
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
            ? 'Add Link'
            : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard/links/web')}
          className="w-full py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
            Delete Link
          </button>
        )}
      </div>
    </form>
  );
}
