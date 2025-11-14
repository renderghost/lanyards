'use client';

import Image from 'next/image';
import QRCodeButton from './QRCodeButton';
import type {
  Profile,
  Affiliation,
  Link as WebLink,
  Work,
  Event,
} from '@/types';

interface ProfileViewProps {
  profile: Profile;
  affiliations: Affiliation[];
  webLinks: WebLink[];
  works: Work[];
  events: Event[];
  isOwner?: boolean;
}

export default function ProfileView({
  profile,
  affiliations,
  webLinks,
  works,
  events,
  isOwner = false,
}: ProfileViewProps) {
  const primaryAffiliation = affiliations.find((a) => a.isPrimary);
  const currentAffiliations = affiliations.filter((a) => !a.endDate);

  // Separate social and custom web links
  const socialLinks = webLinks.filter((l) => l.type === 'social' || l.type === 'academic');
  const customLinks = webLinks.filter((l) => l.type === 'web');
  const blueskyProfile = socialLinks.find((s) => s.platform === 'bluesky');

  // Format display name with honorific
  const getDisplayName = () => {
    const name = profile.displayName || profile.handle;
    if (profile.honorific && profile.honorific !== 'none') {
      return `${profile.honorific}. ${name}`;
    }
    return name;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section - Mobile-first */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto">
          {/* Banner */}
          {profile.banner && (
            <div className="relative w-full h-48 bg-gray-200">
              <Image
                src={profile.banner}
                alt="Profile banner"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="px-4 py-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4 mb-4">
              {profile.avatar && (
                <div className={profile.banner ? '-mt-16' : ''}>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-gray-200">
                    <Image
                      src={profile.avatar}
                      alt={getDisplayName()}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">
                  {getDisplayName()}
                </h1>
                <a
                  href={`https://bsky.app/profile/${profile.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 hover:underline"
                >
                  @{profile.handle}
                </a>
              </div>
            </div>

          {/* Description */}
          {profile.description && (
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{profile.description}</p>
          )}

          {/* Location */}
          {profile.location && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {profile.location.city && `${profile.location.city}, `}
                {profile.location.country}
              </span>
            </div>
          )}

          {/* Current Affiliation */}
          {primaryAffiliation && (
            <div className="text-sm text-gray-600 mb-4">
              <p className="font-medium">{primaryAffiliation.organization.name}</p>
              {primaryAffiliation.role && <p>{primaryAffiliation.role}</p>}
            </div>
          )}

          {/* Primary Action - Edit Profile or Follow on Bluesky */}
          {isOwner ? (
            <a
              href="/dashboard/profile/edit"
              className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-2"
            >
              Edit Profile
            </a>
          ) : blueskyProfile ? (
            <a
              href={blueskyProfile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-2"
            >
              Follow on Bluesky
            </a>
          ) : null}

          {/* QR Code Button */}
          <div>
            <QRCodeButton
              url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${profile.handle}`}
              handle={profile.handle}
            />
          </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Social & Academic Links */}
        {socialLinks.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Connect</h2>
            <div className="space-y-2">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-600 hover:underline"
                >
                  <span className="capitalize">{social.platform}</span>
                  {social.username && (
                    <span className="text-gray-500">@{social.username}</span>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Custom Web Links */}
        {customLinks.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Links</h2>
            <div className="space-y-2">
              {customLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  {link.title || link.url}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Affiliations */}
        {currentAffiliations.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Affiliations</h2>
            <div className="space-y-3">
              {currentAffiliations.map((affiliation, idx) => (
                <div key={idx}>
                  <p className="font-medium">
                    {affiliation.organization.name}
                  </p>
                  {affiliation.role && (
                    <p className="text-sm text-gray-600">{affiliation.role}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(affiliation.startDate).getFullYear()} - Present
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Research */}
        {works.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">
              Research
            </h2>
            <div className="space-y-4">
              {works.map((work, idx) => (
                <div key={idx} className="border-b border-gray-100 last:border-0 pb-3">
                  <p className="font-medium">{work.title || work.doi}</p>
                  {work.authors && work.authors.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {work.authors.join(', ')}
                    </p>
                  )}
                  {work.venue && (
                    <p className="text-sm text-gray-500">{work.venue}</p>
                  )}
                  <a
                    href={`https://doi.org/${work.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    DOI: {work.doi}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Events */}
        {events.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Academic Events</h2>
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div key={idx}>
                  <p className="font-medium">{event.name}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {event.type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.startDate).toLocaleDateString()}
                    {event.endDate &&
                      ` - ${new Date(event.endDate).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
