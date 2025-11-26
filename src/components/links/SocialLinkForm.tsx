'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LinkSocial, SocialPlatform } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

interface SocialLinkFormProps {
  mode: 'create' | 'edit';
  link?: LinkSocial & { rkey: string };
  rkey?: string;
}

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'mastodon', label: 'Mastodon' },
  { value: 'researchgate', label: 'ResearchGate' },
  { value: 'googlescholar', label: 'Google Scholar' },
  { value: 'orcid', label: 'ORCID' },
  { value: 'semble', label: 'Semble' },
  { value: 'other', label: 'Other' },
];

export default function SocialLinkForm({
  mode,
  link,
  rkey,
}: SocialLinkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const [formData, setFormData] = useState({
    platform: (link?.platform as SocialPlatform) || 'twitter',
    url: link?.url || '',
  });

  const getPlaceholderURL = (platform: SocialPlatform): string => {
    const placeholders: Record<SocialPlatform, string> = {
      bluesky: 'https://bsky.app/profile/username.bsky.social',
      twitter: 'https://twitter.com/username',
      linkedin: 'https://linkedin.com/in/username',
      mastodon: 'https://mastodon.social/@username',
      researchgate: 'https://researchgate.net/profile/Name',
      googlescholar: 'https://scholar.google.com/citations?user=ID',
      orcid: 'https://orcid.org/0000-0000-0000-0000',
      semble: 'https://semble.so/profile/username',
      other: 'https://example.com/profile',
    };
    return placeholders[platform] || placeholders.other;
  };

  const getHelpText = (platform: SocialPlatform): string => {
    if (platform === 'orcid') {
      return 'Full ORCID URL (e.g., https://orcid.org/0000-0003-3674-627X)';
    }
    return 'Full URL to your profile on this platform';
  };

  const validateORCID = (url: string): boolean => {
    // ORCID URLs must be in format: https://orcid.org/0000-0000-0000-0000
    // where each 0 can be any digit, and last digit can be 0-9 or X
    const orcidPattern = /^https:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
    return orcidPattern.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate ORCID URL format
    if (formData.platform === 'orcid' && !validateORCID(formData.url)) {
      setError('Invalid ORCID URL format. Must be: https://orcid.org/0000-0000-0000-0000 (where 0s are digits, last can be X)');
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        mode === 'create'
          ? '/api/links/social'
          : `/api/links/social?rkey=${encodeURIComponent(rkey || '')}`;

      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save social link');
      }

      router.push('/dashboard/socials');
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
        `/api/links/social?rkey=${encodeURIComponent(rkey || '')}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete social link');
      }

      router.push('/dashboard/socials');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      setShowDelete(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    platform: value as SocialPlatform,
                  })
                }
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Profile URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder={getPlaceholderURL(formData.platform)}
                required
              />
              <p className="text-sm text-muted-foreground leading-normal">
                {getHelpText(formData.platform)}
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? 'Saving...'
                : mode === 'create'
                  ? 'Add Link'
                  : 'Save Changes'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/socials')}
              className="w-full"
            >
              Cancel
            </Button>

            {mode === 'edit' && (
              <Button
                type="button"
                variant={showDelete ? 'destructive' : 'outline'}
                onClick={handleDelete}
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? 'Deleting...'
                  : showDelete
                    ? 'Click again to confirm deletion'
                    : 'Delete Link'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
