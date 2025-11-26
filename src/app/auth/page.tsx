import LoginForm from '@/components/auth/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl leading-8">
              Sign in to Lanyards
            </CardTitle>
            <CardDescription className="leading-5">
              Use your Bluesky app password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 text-center text-sm leading-5 text-muted-foreground">
          <p>
            Don&apos;t have a Bluesky account?{' '}
            <Link
              href="https://bsky.app"
              target="_blank"
              rel="noopener noreferrer"
              className="leading-normal"
            >
              Create one here
            </Link>
          </p>
          <p>
            Need an app password?{' '}
            <Link
              href="https://bsky.app/settings/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
              className="leading-normal"
            >
              Generate one in settings
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
