'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Affiliation, OrganizationType } from '@/types';

interface AffiliationFormProps {
  mode: 'create' | 'edit';
  affiliation?: Affiliation & { rkey: string };
  rkey?: string;
}

const ORGANIZATION_TYPES: { value: OrganizationType; label: string }[] = [
  { value: 'institution', label: 'Academic Institution' },
  { value: 'company', label: 'Company' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

export default function AffiliationForm({
  mode,
  affiliation,
  rkey,
}: AffiliationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const [formData, setFormData] = useState({
    organizationName: affiliation?.organizationName || '',
    organizationType: (affiliation?.organizationType || 'institution') as OrganizationType,
    role: affiliation?.role || '',
    startDate: affiliation?.startDate
      ? new Date(affiliation.startDate).toISOString().split('T')[0]
      : '',
    endDate: affiliation?.endDate
      ? new Date(affiliation.endDate).toISOString().split('T')[0]
      : '',
    isPrimary: affiliation?.isPrimary || false,
    website: affiliation?.website || '',
    city: affiliation?.location?.city || '',
    country: affiliation?.location?.country || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        role: formData.role || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        isPrimary: formData.isPrimary,
        website: formData.website || undefined,
        location:
          formData.city || formData.country
            ? {
                city: formData.city || undefined,
                country: formData.country || undefined,
              }
            : undefined,
      };

      const endpoint =
        mode === 'create'
          ? '/api/about/affiliations'
          : `/api/about/affiliations?rkey=${encodeURIComponent(rkey || '')}`;

      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save affiliation');
      }

      router.push('/dashboard/about/affiliations');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDelete) {
      setShowDelete(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/about/affiliations?rkey=${encodeURIComponent(rkey || '')}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete affiliation');
      }

      router.push('/dashboard/about/affiliations');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      setShowDelete(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            value={formData.organizationName}
            onChange={(e) =>
              setFormData({ ...formData, organizationName: e.target.value })
            }
            placeholder="e.g., Stanford University"
            required
            maxLength={300}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Type
          </label>
          <select
            value={formData.organizationType}
            onChange={(e) =>
              setFormData({
                ...formData,
                organizationType: e.target.value as OrganizationType,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ORGANIZATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role/Position
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g., Research Fellow, Professor"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty if current
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="e.g., Cambridge"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="e.g., United States"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            placeholder="https://example.edu"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPrimary}
              onChange={(e) =>
                setFormData({ ...formData, isPrimary: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              This is my primary affiliation
            </span>
          </label>
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
            ? 'Saving...'
            : mode === 'create'
              ? 'Add Affiliation'
              : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard/about/affiliations')}
          className="w-full py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              showDelete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-red-300 text-red-600 hover:bg-red-50'
            }`}
          >
            {loading
              ? 'Deleting...'
              : showDelete
                ? 'Click again to confirm deletion'
                : 'Delete Affiliation'}
          </button>
        )}
      </div>
    </form>
  );
}
