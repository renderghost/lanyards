'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LinkWork } from '@/types';
import { formatWorkType } from '@/lib/utils';
import { normalizeDOI } from '@/lib/data/doi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResearchFormProps {
  mode: 'create' | 'edit';
  initialData?: LinkWork & { rkey?: string };
}

export default function ResearchForm({ mode, initialData }: ResearchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resolvingDOI, setResolvingDOI] = useState(false);
  const [error, setError] = useState('');
  const [resolvedMetadata, setResolvedMetadata] = useState<{
    title?: string;
    authors?: string[];
    journal?: string;
    publicationDate?: string;
    type?: string;
    abstract?: string;
    url?: string;
  } | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const [formData, setFormData] = useState({
    doi: initialData?.doi || '',
    rkey: initialData?.rkey,
  });

  const handleDOIBlur = () => {
    if (formData.doi) {
      const normalized = normalizeDOI(formData.doi);
      if (normalized !== formData.doi) {
        setFormData({ ...formData, doi: normalized });
      }
    }
  };

  const handleResolveDOI = async () => {
    if (!formData.doi) return;

    setResolvingDOI(true);
    setError('');
    setResolvedMetadata(null);

    try {
      const response = await fetch(
        `/api/doi/resolve?doi=${encodeURIComponent(formData.doi)}`
      );

      if (!response.ok) {
        throw new Error('Failed to resolve DOI');
      }

      const data = await response.json();
      setResolvedMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve DOI');
    } finally {
      setResolvingDOI(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    bypassDuplicateCheck = false
  ) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowDuplicateWarning(false);

    try {
      const payload = { doi: formData.doi, bypassDuplicateCheck };

      const response = await fetch('/api/profile/works', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'DUPLICATE_DOI' && !bypassDuplicateCheck) {
          setShowDuplicateWarning(true);
          setError(data.message);
          setLoading(false);
          return;
        }
        throw new Error(data.error || `Failed to ${mode} research`);
      }

      router.push('/dashboard/research');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleAddDuplicate = (e: React.FormEvent) => {
    handleSubmit(e, true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this research item?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/profile/works?rkey=${encodeURIComponent(formData.rkey || '')}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete research');
      }

      router.push('/dashboard/research');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete research'
      );
      setLoading(false);
    }
  };

  return (
    <form id="research-form" onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doi">DOI *</Label>
            <div className="flex gap-2">
              <Input
                id="doi"
                type="text"
                value={formData.doi}
                onChange={(e) =>
                  setFormData({ ...formData, doi: e.target.value })
                }
                onBlur={handleDOIBlur}
                required
                disabled={mode === 'edit'}
                placeholder="10.1234/example or https://doi.org/10.1234/example"
              />
              {mode === 'create' && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResolveDOI}
                  disabled={!formData.doi || resolvingDOI}
                >
                  {resolvingDOI ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resolving
                    </>
                  ) : (
                    'Resolve'
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {mode === 'create'
                ? 'Paste any DOI format - URLs will be automatically cleaned'
                : 'DOI cannot be changed after creation'}
            </p>
          </div>

          {resolvedMetadata && (
            <Alert className="border-primary/50 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="ml-2">
                <p className="font-medium mb-2">DOI Resolved Successfully</p>
                <div className="space-y-1 text-sm">
                  {resolvedMetadata.title && (
                    <p>
                      <strong>Title:</strong> {resolvedMetadata.title}
                    </p>
                  )}
                  {resolvedMetadata.authors && (
                    <p>
                      <strong>Authors:</strong>{' '}
                      {resolvedMetadata.authors.join(', ')}
                    </p>
                  )}
                  {resolvedMetadata.journal && (
                    <p>
                      <strong>Venue:</strong> {resolvedMetadata.journal}
                    </p>
                  )}
                  {resolvedMetadata.publicationDate && (
                    <p>
                      <strong>Published:</strong>{' '}
                      {new Date(resolvedMetadata.publicationDate).getFullYear()}
                    </p>
                  )}
                  {resolvedMetadata.type && (
                    <p>
                      <strong>Type:</strong>{' '}
                      {formatWorkType(resolvedMetadata.type)}
                    </p>
                  )}
                  {resolvedMetadata.abstract && (
                    <p>
                      <strong>Abstract:</strong>{' '}
                      {resolvedMetadata.abstract.substring(0, 200)}
                      {resolvedMetadata.abstract.length > 200 ? '...' : ''}
                    </p>
                  )}
                  {resolvedMetadata.url && (
                    <p>
                      <strong>URL:</strong>{' '}
                      <a
                        href={resolvedMetadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        {resolvedMetadata.url}
                      </a>
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {mode === 'edit' && initialData && (
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">Work Metadata</p>
                <div className="space-y-1 text-sm">
                  {initialData.title && (
                    <p>
                      <strong>Title:</strong> {initialData.title}
                    </p>
                  )}
                  {initialData.authors && initialData.authors.length > 0 && (
                    <p>
                      <strong>Authors:</strong> {initialData.authors.join(', ')}
                    </p>
                  )}
                  {initialData.venue && (
                    <p>
                      <strong>Venue:</strong> {initialData.venue}
                    </p>
                  )}
                  {initialData.publicationDate && (
                    <p>
                      <strong>Published:</strong>{' '}
                      {new Date(initialData.publicationDate).getFullYear()}
                    </p>
                  )}
                  {initialData.type && (
                    <p>
                      <strong>Type:</strong> {formatWorkType(initialData.type)}
                    </p>
                  )}
                  {'abstract' in initialData &&
                    initialData.abstract &&
                    typeof initialData.abstract === 'string' && (
                      <p>
                        <strong>Abstract:</strong>{' '}
                        {initialData.abstract.substring(0, 200)}
                        {initialData.abstract.length > 200 ? '...' : ''}
                      </p>
                    )}
                  {'url' in initialData &&
                    initialData.url &&
                    typeof initialData.url === 'string' && (
                      <p>
                        <strong>URL:</strong>{' '}
                        <a
                          href={initialData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-primary"
                        >
                          {initialData.url}
                        </a>
                      </p>
                    )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <p>{error}</p>
            {showDuplicateWarning && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleAddDuplicate}
                disabled={loading}
                className="p-0 h-auto text-destructive-foreground underline"
              >
                Add anyway
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 mt-6">
        {mode === 'create' && (
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Research'
            )}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/research')}
          disabled={loading}
          className="w-full"
        >
          {mode === 'edit' ? 'Back' : 'Cancel'}
        </Button>

        {mode === 'edit' && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Delete Research
          </Button>
        )}
      </div>
    </form>
  );
}
