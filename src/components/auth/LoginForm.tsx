'use client';

import { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div>
        <label
          htmlFor="identifier"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Username or Handle
        </label>
        <input
          type="text"
          id="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="username.bsky.social or username"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={loading}
          autoComplete="username"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter your Bluesky handle or username
        </p>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          App Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="xxxx-xxxx-xxxx-xxxx"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={loading}
          autoComplete="current-password"
        />
        <p className="mt-1 text-sm text-gray-500">
          Get your app password from{' '}
          <a
            href="https://bsky.app/settings/app-passwords"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Bluesky settings
          </a>
        </p>
      </div>

      <div>
        <label
          htmlFor="pdsUrl"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          PDS Server (optional)
        </label>
        <input
          type="url"
          id="pdsUrl"
          value={pdsUrl}
          onChange={(e) => setPdsUrl(e.target.value)}
          placeholder="https://bsky.social"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Defaults to bsky.social - only change if using a custom PDS
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !identifier || !password}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Sign in to access your Lanyards profile
      </p>
    </form>
  );
}
