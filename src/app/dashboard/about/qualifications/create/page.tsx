import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import QualificationForm from '@/components/about/QualificationForm';
import Link from 'next/link';

export default async function CreateQualificationPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/about/qualifications"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <h1 className="text-xl font-bold">Add Qualification</h1>
          <p className="text-sm text-gray-600 mt-1">
            Add your academic degree, certification, or professional qualification
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <QualificationForm mode="create" />
      </div>
    </main>
  );
}
