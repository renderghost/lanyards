'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/oauth/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate login');
      }

      await sleep(200);

      window.location.assign(data.redirectUrl);

      await new Promise((_resolve, reject) => {
        const listener = () => {
          reject(new Error('User aborted the login request'));
        };

        window.addEventListener('pageshow', listener, { once: true });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="identifier" className="leading-5">
            Bluesky Handle
          </Label>
          <Input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="username.bsky.social"
            required
            disabled={loading}
            autoComplete="username"
            aria-describedby="identifier-help"
          />
          <p
            id="identifier-help"
            className="text-sm leading-5 text-muted-foreground"
          >
            Enter your Bluesky handle to sign in
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="leading-5">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={loading || !identifier}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in with Bluesky'
        )}
      </Button>
    </form>
  );
}
