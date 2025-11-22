'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CountrySelector from '@/components/CountrySelector';
import { AlertCircle, Pencil } from 'lucide-react';
import type { HonorificValue } from '@/types';

interface AcademicInfoDialogProps {
  honorific?: HonorificValue;
  location?: {
    city?: string;
    country?: string;
  };
}

const HONORIFIC_OPTIONS: { value: HonorificValue; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'Dr', label: 'Dr.' },
  { value: 'Prof', label: 'Prof.' },
];

export default function AcademicInfoDialog({
  honorific,
  location,
}: AcademicInfoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    city?: string;
    country?: string;
  }>({});

  const [formData, setFormData] = useState({
    honorific: (honorific || 'none') as HonorificValue,
    city: location?.city || '',
    country: location?.country || '',
  });

  const validate = () => {
    const errors: { city?: string; country?: string } = {};

    // If city is provided, country should also be provided
    if (formData.city && !formData.country) {
      errors.country = 'Country is required when city is specified';
    }

    // City validation: only letters, spaces, hyphens, apostrophes
    if (formData.city && !/^[a-zA-Z\s\-']+$/.test(formData.city)) {
      errors.city = 'City can only contain letters, spaces, hyphens, and apostrophes';
    }

    // City length validation
    if (formData.city && formData.city.length > 100) {
      errors.city = 'City name is too long (max 100 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

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

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form to original values when closing
      setFormData({
        honorific: (honorific || 'none') as HonorificValue,
        city: location?.city || '',
        country: location?.country || '',
      });
      setError('');
      setValidationErrors({});
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Academic Information</DialogTitle>
            <DialogDescription>
              Update your honorific and location. These are displayed on your
              public profile.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <Label>Honorific</Label>
              <RadioGroup
                value={formData.honorific}
                onValueChange={(value) =>
                  setFormData({ ...formData, honorific: value as HonorificValue })
                }
                className="flex gap-4"
              >
                {HONORIFIC_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-sm text-muted-foreground">
                Choose one (tradition: use Dr. or Prof., never both)
              </p>
            </div>

            <div className="space-y-3">
              <Label>Location</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                    aria-invalid={!!validationErrors.city}
                    aria-describedby={validationErrors.city ? 'city-error' : undefined}
                  />
                  {validationErrors.city && (
                    <p id="city-error" className="text-sm text-destructive">
                      {validationErrors.city}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <CountrySelector
                    value={formData.country}
                    onChange={(value) =>
                      setFormData({ ...formData, country: value })
                    }
                  />
                  {validationErrors.country && (
                    <p id="country-error" className="text-sm text-destructive">
                      {validationErrors.country}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your primary location
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
