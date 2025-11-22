'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LinkWeb } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface LinkFormProps {
  mode: 'create' | 'edit';
  initialData?: LinkWeb & { rkey?: string };
}

export default function LinkForm({ mode, initialData }: LinkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    url: initialData?.url || '',
    title: initialData?.title || '',
    rkey: initialData?.rkey,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint =
        mode === 'create'
          ? '/api/profile/links'
          : `/api/profile/links?rkey=${encodeURIComponent(formData.rkey || '')}`;

      const payload = {
        url: formData.url,
        title: formData.title || undefined,
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

      router.push('/dashboard/links');
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

      router.push('/dashboard/links');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                required
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Personal Website"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                Display name for this link
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
                ? mode === 'create'
                  ? 'Adding...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Add Link'
                  : 'Save Changes'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/links')}
              className="w-full"
            >
              Cancel
            </Button>

            {mode === 'edit' && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
                className="w-full text-destructive hover:text-destructive"
              >
                Delete Link
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
