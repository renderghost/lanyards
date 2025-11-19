'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Qualification, QualificationType } from '@/types';

interface QualificationFormProps {
  mode: 'create' | 'edit';
  qualification?: Qualification & { rkey: string };
  rkey?: string;
}

const QUALIFICATION_TYPES: { value: QualificationType; label: string }[] = [
  { value: 'phd', label: 'PhD' },
  { value: 'masters', label: 'Masters' },
  { value: 'bachelors', label: 'Bachelors' },
  { value: 'postdoc', label: 'Postdoc' },
  { value: 'certification', label: 'Certification' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'other', label: 'Other' },
];

export default function QualificationForm({
  mode,
  qualification,
  rkey,
}: QualificationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const [formData, setFormData] = useState({
    title: qualification?.title || '',
    type: (qualification?.type || 'bachelors') as QualificationType,
    institution: qualification?.institution || '',
    field: qualification?.field || '',
    dateAwarded: qualification?.dateAwarded
      ? new Date(qualification.dateAwarded).toISOString().split('T')[0]
      : '',
    city: qualification?.location?.city || '',
    country: qualification?.location?.country || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        institution: formData.institution,
        field: formData.field || undefined,
        dateAwarded: formData.dateAwarded
          ? new Date(formData.dateAwarded).toISOString()
          : undefined,
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
          ? '/api/about/qualifications'
          : `/api/about/qualifications?rkey=${encodeURIComponent(rkey || '')}`;

      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save qualification');
      }

      router.push('/dashboard/about/qualifications');
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
        `/api/about/qualifications?rkey=${encodeURIComponent(rkey || '')}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete qualification');
      }

      router.push('/dashboard/about/qualifications');
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
            Qualification Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., PhD in Computer Science"
            required
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as QualificationType,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {QUALIFICATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution *
          </label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) =>
              setFormData({ ...formData, institution: e.target.value })
            }
            placeholder="e.g., Stanford University"
            required
            maxLength={300}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field of Study
          </label>
          <input
            type="text"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            placeholder="e.g., Artificial Intelligence, Molecular Biology"
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Awarded
          </label>
          <input
            type="date"
            value={formData.dateAwarded}
            onChange={(e) =>
              setFormData({ ...formData, dateAwarded: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
              ? 'Add Qualification'
              : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard/about/qualifications')}
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
                : 'Delete Qualification'}
          </button>
        )}
      </div>
    </form>
  );
}
