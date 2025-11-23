'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pdsUrl, setPdsUrl] = useState('https://bsky.social');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password, pdsUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Redirect to dashboard on successful login
      if (data.redirect) {
        window.location.href = data.redirect;
      }
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
            Username or Handle
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
            Enter your Bluesky handle or username
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="leading-5">
            App Password
          </Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="xxxx-xxxx-xxxx-xxxx"
            required
            disabled={loading}
            autoComplete="current-password"
            aria-describedby="password-help"
          />
          <p
            id="password-help"
            className="text-sm leading-5 text-muted-foreground"
          >
            Get your app password from{' '}
            <Link
              href="https://bsky.app/settings/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Bluesky settings
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="pdsUrl" className="leading-5">
            PDS Server (optional)
          </Label>
          <Input
            type="url"
            id="pdsUrl"
            value={pdsUrl}
            onChange={(e) => setPdsUrl(e.target.value)}
            placeholder="https://bsky.social"
            disabled={loading}
            aria-describedby="pds-help"
          />
          <p id="pds-help" className="text-sm leading-5 text-muted-foreground">
            Defaults to bsky.social - only change if using a custom PDS
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
        disabled={loading || !identifier || !password}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}
