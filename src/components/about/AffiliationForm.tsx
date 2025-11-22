'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Affiliation, OrganizationType } from '@/types';
import CountrySelector from '@/components/CountrySelector/CountrySelector';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

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
    organizationType: (affiliation?.organizationType ||
      'institution') as OrganizationType,
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
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,
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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={(e) =>
                  setFormData({ ...formData, organizationName: e.target.value })
                }
                placeholder="e.g., Stanford University"
                required
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType">Organization Type</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    organizationType: value as OrganizationType,
                  })
                }
              >
                <SelectTrigger id="organizationType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role/Position</Label>
              <Input
                id="role"
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="e.g., Research Fellow, Professor"
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty if current
                </p>
              </div>
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
                <CountrySelector
                  value={formData.country}
                  onChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                  placeholder="Select a country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://example.edu"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrimary: checked === true })
                }
              />
              <Label
                htmlFor="isPrimary"
                className="text-sm font-normal cursor-pointer"
              >
                This is my primary affiliation
              </Label>
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
                  ? 'Add Affiliation'
                  : 'Save Changes'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/about/affiliations')}
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
                    : 'Delete Affiliation'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
