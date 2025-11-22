'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Qualification, QualificationType } from '@/types';
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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Qualification Title *</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., PhD in Computer Science"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as QualificationType,
                  })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {QUALIFICATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                type="text"
                value={formData.institution}
                onChange={(e) =>
                  setFormData({ ...formData, institution: e.target.value })
                }
                placeholder="e.g., Stanford University"
                required
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                type="text"
                value={formData.field}
                onChange={(e) =>
                  setFormData({ ...formData, field: e.target.value })
                }
                placeholder="e.g., Artificial Intelligence, Molecular Biology"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateAwarded">Date Awarded</Label>
              <Input
                id="dateAwarded"
                type="date"
                value={formData.dateAwarded}
                onChange={(e) =>
                  setFormData({ ...formData, dateAwarded: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g., Cambridge"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="e.g., United States"
                />
              </div>
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
                  ? 'Add Qualification'
                  : 'Save Changes'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/about/qualifications')}
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
                    : 'Delete Qualification'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
