'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Link as WebLink, LinkType, LinkPlatform } from '@/types';

interface LinkFormProps {
  mode: 'create' | 'edit';
  initialData?: WebLink & { rkey?: string };
}

const LINK_TYPES: { value: LinkType; label: string }[] = [
  { value: 'social', label: 'Social Media' },
  { value: 'academic', label: 'Academic Profile' },
  { value: 'web', label: 'Custom Web Link' },
];

const PLATFORMS: Record<LinkType, { value: LinkPlatform; label: string }[]> = {
  social: [
    { value: 'bluesky', label: 'Bluesky' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
  ],
  academic: [
    { value: 'orcid', label: 'ORCID' },
    { value: 'googlescholar', label: 'Google Scholar' },
    { value: 'researchgate', label: 'ResearchGate' },
    { value: 'semble', label: 'Semble' },
  ],
  web: [{ value: 'custom', label: 'Custom Link' }],
};

export default function LinkForm({
  mode,
  initialData,
}: LinkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: initialData?.type || ('' as LinkType | ''),
    platform: initialData?.platform || ('' as LinkPlatform | ''),
    url: initialData?.url || '',
    title: initialData?.title || '',
    username: initialData?.username || '',
    rkey: initialData?.rkey,
  });

  const availablePlatforms =
    formData.type && PLATFORMS[formData.type] ? PLATFORMS[formData.type] : [];

  const handleTypeChange = (newType: LinkType) => {
    setFormData({
      ...formData,
      type: newType,
      platform: '', // Reset platform when type changes
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = mode === 'create'
        ? {
            type: formData.type,
            platform: formData.platform,
            url: formData.url,
            title: formData.title || undefined,
            username: formData.username || undefined,
          }
        : {
            rkey: formData.rkey,
            type: formData.type,
            platform: formData.platform,
            url: formData.url,
            title: formData.title || undefined,
            username: formData.username || undefined,
          };

      const response = await fetch('/api/profile/links', {
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

  const showTitle = formData.type === 'web';
  const showUsername = formData.type === 'social' || formData.type === 'academic';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as LinkType)}
            required
            disabled={mode === 'edit'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">Select type...</option>
            {LINK_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {mode === 'edit' && (
            <p className="mt-1 text-sm text-gray-500">
              Type cannot be changed after creation
            </p>
          )}
        </div>

        {formData.type && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform *
            </label>
            <select
              value={formData.platform}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  platform: e.target.value as LinkPlatform,
                })
              }
              required
              disabled={mode === 'edit'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select platform...</option>
              {availablePlatforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
            {mode === 'edit' && (
              <p className="mt-1 text-sm text-gray-500">
                Platform cannot be changed after creation
              </p>
            )}
          </div>
        )}

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

        {showTitle && (
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
        )}

        {showUsername && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username/Handle
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="e.g., johndoe"
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Your username on this platform
            </p>
          </div>
        )}
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
          onClick={() => router.push('/dashboard/links')}
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
