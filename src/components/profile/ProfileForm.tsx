'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Lock, MapPin } from 'lucide-react';
import AcademicInfoDialog from './AcademicInfoDialog';
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
  handle: string;
}

interface ProfileFormProps {
  profile: ProfileData;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const getDisplayName = () => {
    const name = profile.displayName || profile.handle || 'User';
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
    <div className="space-y-6">
      {/* Bluesky Profile Preview (Locked Fields) */}
      <Card className="pt-0">
        {/* Banner */}
        {profile.banner && (
          <div className="relative w-full h-32 bg-muted rounded-t-xl overflow-hidden">
            <Image
              src={profile.banner}
              alt="Profile banner"
              fill
              className="object-cover"
            />
          </div>
        )}

        <CardContent className={profile.banner ? 'pt-6' : 'pt-6'}>
          {/* Avatar */}
          <div className={profile.banner ? '-mt-12 mb-4' : 'mb-4'}>
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage
                src={profile.avatar}
                alt={profile.displayName || profile.handle || 'Profile avatar'}
              />
              <AvatarFallback className="text-lg">
                {getInitials(profile.displayName || profile.handle || 'U')}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Display Name
              </label>
              <div className="text-foreground bg-muted px-4 py-2 rounded-lg">
                {profile.displayName || 'Not set'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Handle
              </label>
              <div className="text-foreground bg-muted px-4 py-2 rounded-lg">
                @{profile.handle}
              </div>
            </div>
            {profile.description && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Bio
                </label>
                <div className="text-foreground bg-muted px-4 py-2 rounded-lg whitespace-pre-wrap">
                  {profile.description}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Synced
            </Badge>
            <p className="text-xs text-muted-foreground leading-normal">
              Update these fields in your{' '}
              <Link
                href={`https://bsky.app/profile/${profile.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="leading-normal"
              >
                Bluesky settings
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information (Editable) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Academic Information</CardTitle>
            <AcademicInfoDialog
              honorific={profile.honorific}
              location={profile.location}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Honorific
            </label>
            <div className="text-foreground">
              {profile.honorific && profile.honorific !== 'none'
                ? `${profile.honorific}.`
                : 'None'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Location
            </label>
            {profile.location?.city || profile.location?.country ? (
              <div className="flex items-center gap-1 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {profile.location.city && `${profile.location.city}, `}
                  {profile.location.country}
                </span>
              </div>
            ) : (
              <div className="text-muted-foreground">Not set</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
