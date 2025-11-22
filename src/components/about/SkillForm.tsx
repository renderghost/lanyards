'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Skill, SkillCategory, SkillProficiency } from '@/types';
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

interface SkillFormProps {
  mode: 'create' | 'edit';
  skill?: Skill & { rkey: string };
  rkey?: string;
}

const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'methodological', label: 'Methodological' },
  { value: 'domain-expertise', label: 'Domain Expertise' },
  { value: 'language', label: 'Language' },
  { value: 'other', label: 'Other' },
];

const PROFICIENCY_LEVELS: { value: SkillProficiency; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export default function SkillForm({ mode, skill, rkey }: SkillFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const [formData, setFormData] = useState({
    name: skill?.name || '',
    category: (skill?.category || 'technical') as SkillCategory,
    proficiency: (skill?.proficiency || 'intermediate') as SkillProficiency,
    yearsOfExperience: skill?.yearsOfExperience?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        proficiency: formData.proficiency || undefined,
        yearsOfExperience: formData.yearsOfExperience
          ? parseInt(formData.yearsOfExperience, 10)
          : undefined,
      };

      const endpoint =
        mode === 'create'
          ? '/api/about/skills'
          : `/api/about/skills?rkey=${encodeURIComponent(rkey || '')}`;

      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save skill');
      }

      router.push('/dashboard/about/skills');
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
        `/api/about/skills?rkey=${encodeURIComponent(rkey || '')}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete skill');
      }

      router.push('/dashboard/about/skills');
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
              <Label htmlFor="name">Skill Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Machine Learning, Python, Statistical Analysis"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as SkillCategory,
                  })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proficiency">Proficiency Level</Label>
              <Select
                value={formData.proficiency}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    proficiency: value as SkillProficiency,
                  })
                }
              >
                <SelectTrigger id="proficiency">
                  <SelectValue placeholder="Select proficiency" />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                max="100"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearsOfExperience: e.target.value,
                  })
                }
                placeholder="e.g., 5"
              />
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
                  ? 'Add Skill'
                  : 'Save Changes'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/about/skills')}
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
                    : 'Delete Skill'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
