import LoginForm from '@/components/auth/LoginForm';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Lanyards</h1>
          <p className="text-gray-600">
            Sign in with your Bluesky app password
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <LoginForm />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don&apos;t have a Bluesky account?{' '}
            <a
              href="https://bsky.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Create one here
            </a>
          </p>
          <p className="mt-2">
            Need an app password?{' '}
            <a
              href="https://bsky.app/settings/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Generate one in settings
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
