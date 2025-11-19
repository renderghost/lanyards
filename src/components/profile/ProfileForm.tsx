'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { HonorificValue } from '@/types';

interface ProfileData {
  honorific?: HonorificValue;
  location?: {
    city?: string;
    country?: string;
  };
  displayName?: string;
  avatar?: string;
  banner?: string;
  description?: string;
  handle?: string;
}

interface ProfileFormProps {
  profile: ProfileData;
}

const HONORIFIC_OPTIONS: { value: HonorificValue; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'Dr', label: 'Dr.' },
  { value: 'Prof', label: 'Prof.' },
];

// Sample of ISO countries - user can expand this list later
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
  'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
  'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
  'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa',
  'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
  'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    honorific: profile.honorific || 'none',
    city: profile.location?.city || '',
    country: profile.location?.country || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        honorific: formData.honorific,
        location:
          formData.city || formData.country
            ? {
                city: formData.city || undefined,
                country: formData.country || undefined,
              }
            : undefined,
      };

      const response = await fetch('/api/profile/basics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Preview (Locked Fields) */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 p-6 pb-4">
          <h2 className="font-semibold">Bluesky Profile</h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Locked
          </span>
        </div>

        {/* Banner */}
        {profile.banner && (
          <div className="relative w-full h-32 bg-gray-200">
            <Image
              src={profile.banner}
              alt="Profile banner"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Avatar and Info */}
        <div className="px-6 pb-6">
          {profile.avatar && (
            <div className={`relative mb-4 ${profile.banner ? '-mt-12' : 'mt-4'}`}>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-gray-200">
                <Image
                  src={profile.avatar}
                  alt={profile.displayName || profile.handle || 'Profile avatar'}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {profile.displayName || 'Not set'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handle
              </label>
              <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                @{profile.handle}
              </div>
            </div>
            {profile.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg whitespace-pre-wrap">
                  {profile.description}
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            These fields are synced from your Bluesky profile and cannot be
            edited here. Update them on Bluesky to change them.
          </p>
        </div>
      </div>

      {/* Editable Fields Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Academic Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Honorific
            </label>
            <div className="flex gap-4">
              {HONORIFIC_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="honorific"
                    value={option.value}
                    checked={formData.honorific === option.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        honorific: e.target.value as HonorificValue,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Choose one honorific (tradition: use Dr. or Prof., never both)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Your primary location
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
