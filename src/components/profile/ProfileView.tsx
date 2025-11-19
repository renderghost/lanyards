'use client';

import Image from 'next/image';
import QRCodeButton from './QRCodeButton';
import type {
  Affiliation,
  Qualification,
  Skill,
  LinkSocial,
  LinkWeb,
  LinkWork,
  LinkEvent,
} from '@/types';

interface ProfileViewProps {
  profile: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
    banner?: string;
    description?: string;
    honorific?: string;
    location?: {
      city?: string;
      country?: string;
    };
  };
  affiliations: (Affiliation & { rkey: string; uri: string })[];
  qualifications: (Qualification & { rkey: string; uri: string })[];
  skills: (Skill & { rkey: string; uri: string })[];
  socialLinks: (LinkSocial & { rkey: string })[];
  webLinks: (LinkWeb & { rkey: string })[];
  works: (LinkWork & { rkey: string })[];
  events: (LinkEvent & { rkey: string })[];
  isOwner?: boolean;
}

export default function ProfileView({
  profile,
  affiliations,
  qualifications,
  skills,
  socialLinks,
  webLinks,
  works,
  events,
  isOwner = false,
}: ProfileViewProps) {
  const primaryAffiliation = affiliations.find((a) => a.isPrimary);
  const currentAffiliations = affiliations.filter((a) => !a.endDate);

  // Social links are now separate from web links
  const blueskyProfile = socialLinks.find((s) => s.platform === 'bluesky');

  // Format display name with honorific
  const getDisplayName = () => {
    const name = profile.displayName || profile.handle;
    if (profile.honorific && profile.honorific !== 'none') {
      return `${profile.honorific}. ${name}`;
    }
    return name;
  };

  // Format date consistently to avoid hydration mismatches
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {profile.description}
              </p>
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
                <p className="font-medium">
                  {primaryAffiliation.organizationName}
                </p>
                {primaryAffiliation.role && <p>{primaryAffiliation.role}</p>}
              </div>
            )}

            {/* Primary Action - Go to Dashboard or Follow on Bluesky */}
            {isOwner ? (
              <a
                href="/dashboard"
                className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-2"
              >
                Go to Dashboard
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
            <h2 className="text-lg font-semibold mb-3">Profiles</h2>
            <div className="space-y-2">
              {socialLinks.map((social) => (
                <a
                  key={social.rkey}
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

        {/* Web Links */}
        {webLinks.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Links</h2>
            <div className="space-y-2">
              {webLinks.map((link) => (
                <a
                  key={link.rkey}
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
                  <p className="font-medium">{affiliation.organizationName}</p>
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

        {/* Qualifications */}
        {qualifications.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Qualifications</h2>
            <div className="space-y-3">
              {qualifications.map((qualification, idx) => (
                <div key={idx}>
                  <p className="font-medium">{qualification.title}</p>
                  <p className="text-sm text-gray-600">
                    {qualification.institution}
                  </p>
                  {qualification.field && (
                    <p className="text-sm text-gray-500">
                      {qualification.field}
                    </p>
                  )}
                  {qualification.dateAwarded && (
                    <p className="text-xs text-gray-500">
                      {new Date(qualification.dateAwarded).getFullYear()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Research */}
        {works.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Research</h2>
            <div className="space-y-4">
              {works.map((work, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-100 last:border-0 pb-3"
                >
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
                    {work.doi}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Events */}
        {events.length > 0 && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Events</h2>
            <div className="space-y-4">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-100 last:border-0 pb-3"
                >
                  <p className="font-medium">{event.name}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {event.type}
                  </p>
                  {event.organizerName && (
                    <p className="text-sm text-gray-500">
                      {event.organizerName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatDate(event.startDate)}
                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                  </p>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline block mt-1 break-all"
                    >
                      {event.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
