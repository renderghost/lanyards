'use client';

import Image from 'next/image';
import Link from 'next/link';
import QRCodeButton from './QRCodeButton';
import { normalizeDOI } from '@/lib/data/doi';
import { formatDateUS, formatDisplayURL, formatWorkType } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  ExternalLink,
  Calendar,
  Building2,
  GraduationCap,
  BookOpen,
  Link as LinkIcon,
  Users,
} from 'lucide-react';
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
  const currentAffiliations = affiliations.filter((a) => !a.endDate);

  const blueskyProfile = socialLinks.find((s) => s.platform === 'bluesky');

  const getDisplayName = () => {
    const name = profile.displayName || profile.handle;
    if (profile.honorific && profile.honorific !== 'none') {
      return `${profile.honorific}. ${name}`;
    }
    return name;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Content Sections */}
      <div className="mx-auto w-full max-w-2xl px-4 py-6 space-y-6">
        {/* Header Section */}
        <Card className="py-0">
          {/* Banner */}
          {profile.banner && (
            <div className="relative w-full h-48 bg-muted rounded-t-xl overflow-hidden">
              <Image
                src={profile.banner}
                alt="Profile banner"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <CardContent className="pb-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col gap-3 mb-4">
              <div className={profile.banner ? '-mt-12' : 'pt-6'}>
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={profile.avatar} alt={getDisplayName()} />
                  <AvatarFallback className="text-lg">
                    {getInitials(getDisplayName())}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black leading-normal">
                  {getDisplayName()}
                </h1>
                <a
                  href={`https://bsky.app/profile/${profile.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-muted-foreground hover:text-primary hover:underline leading-normal"
                >
                  @{profile.handle}
                </a>
                {profile.location &&
                  (profile.location.city || profile.location.country) && (
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="leading-normal">
                        {profile.location.city && `${profile.location.city}, `}
                        {profile.location.country}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Description */}
            {profile.description && (
              <p className="text-foreground mb-4 whitespace-pre-wrap">
                {profile.description}
              </p>
            )}

            {/* Current Affiliation */}
            {/* {primaryAffiliation && (
              <div className="text-sm mb-4">
                <p className="font-medium text-foreground">
                  {primaryAffiliation.organizationName}
                </p>
                {primaryAffiliation.role && <p className="text-foreground">{primaryAffiliation.role}</p>}
              </div>
            )} */}

            {/* Primary Action */}
            <div className="flex flex-col sm:flex-row gap-2">
              {isOwner ? (
                <Button asChild className="flex-1">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : blueskyProfile ? (
                <Button asChild className="flex-1">
                  <a
                    href={blueskyProfile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Bluesky
                  </a>
                </Button>
              ) : null}
              <QRCodeButton handle={profile.handle} className="flex-1" />
            </div>
          </CardContent>
        </Card>

        {/* Affiliations */}
        {currentAffiliations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Affiliations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentAffiliations.map((affiliation, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-black leading-normal">{affiliation.organizationName}</p>
                  {affiliation.role && (
                    <p className="text-sm text-foreground leading-normal">
                      {affiliation.role}
                    </p>
                  )}
                  <p className="text-sm text-foreground leading-normal">
                    {new Date(affiliation.startDate).getFullYear()} - Present
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Social & Academic Links */}
        {socialLinks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Social Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {socialLinks.map((social) => {
                const displayName = social.platform === 'orcid'
                  ? 'ORCID'
                  : social.platform.charAt(0).toUpperCase() + social.platform.slice(1);
                return (
                  <div key={social.rkey} className="space-y-1">
                    <p className="font-black leading-normal">{displayName}</p>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-foreground hover:underline break-all leading-normal"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {formatDisplayURL(social.url)}
                    </a>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
        {/* Research */}
        {works.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Research
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {works.map((work, idx) => (
                <div
                  key={idx}
                  className="border-b border-border last:border-0 pb-4 last:pb-0 space-y-1"
                >
                  <a
                    href={`https://doi.org/${normalizeDOI(work.doi)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-black hover:underline leading-normal"
                  >
                    {work.title || work.doi}
                  </a>
                  {work.authors && work.authors.length > 0 && (
                    <p className="text-sm text-foreground leading-normal">
                      {work.authors.join(', ')}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {work.type && (
                      <Badge variant="secondary">
                        {formatWorkType(work.type)}
                      </Badge>
                    )}
                    {work.venue && (
                      <span className="text-sm text-foreground leading-normal">
                        {work.venue}
                      </span>
                    )}
                    {work.publicationDate && (
                      <span className="text-sm text-foreground leading-normal">
                        {new Date(work.publicationDate).getFullYear()}
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://doi.org/${normalizeDOI(work.doi)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-foreground hover:underline leading-normal"
                  >
                    <ExternalLink className="h-3 w-3" />
                    doi.org/{normalizeDOI(work.doi)}
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Events */}
        {events.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event, idx) => {
                const startDate = new Date(event.startDate);
                const isUpcoming = startDate > new Date();
                return (
                  <div
                    key={idx}
                    className="border-b border-border last:border-0 pb-4 last:pb-0 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      {event.url ? (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-black hover:underline leading-normal"
                        >
                          {event.name}
                        </a>
                      ) : (
                        <p className="font-black leading-normal">{event.name}</p>
                      )}
                      {isUpcoming && <Badge variant="default">Upcoming</Badge>}
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {event.type}
                    </Badge>
                    {event.organizerName && (
                      <p className="text-sm text-foreground">
                        {event.organizerName}
                      </p>
                    )}
                    <p className="text-sm text-foreground">
                      {formatDateUS(event.startDate)}
                      {event.endDate && ` - ${formatDateUS(event.endDate)}`}
                    </p>
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-foreground hover:underline break-all"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {formatDisplayURL(event.url)}
                      </a>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Web Links */}
        {webLinks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Other Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {webLinks.map((link) => (
                <div key={link.rkey} className="space-y-1">
                  {link.title && <p className="font-black leading-normal">{link.title}</p>}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-foreground hover:underline break-all leading-normal"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {formatDisplayURL(link.url)}
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Qualifications */}
        {qualifications.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualifications.map((qualification, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-black leading-normal">{qualification.title}</p>
                  <p className="text-sm text-foreground leading-normal">
                    {qualification.institution}
                  </p>
                  {qualification.field && (
                    <p className="text-sm text-foreground leading-normal">
                      {qualification.field}
                    </p>
                  )}
                  {qualification.dateAwarded && (
                    <p className="text-sm text-foreground leading-normal">
                      {new Date(qualification.dateAwarded).getFullYear()}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
