import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';

export default async function SkillsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth');
  }

  const agent = await getAgent();

  if (!agent) {
    redirect('/auth');
  }

  const repo = new ProfileRepository(agent);
  const skills = await repo.listSkills(session.did);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Skills</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your professional and technical skills
              </p>
            </div>
            <Link
              href="/dashboard/about/skills/create"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Skill
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {skills.length === 0 ? (
          // Zero-data state
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">No skills yet</h2>
            <p className="text-gray-600 text-sm mb-6">
              Add your technical, professional, and research skills to showcase
              your expertise.
            </p>
            <Link
              href="/dashboard/about/skills/create"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Skill
            </Link>
          </div>
        ) : (
          // Skills list
          <div className="space-y-4">
            {skills.map((skill) => (
              <div
                key={skill.uri}
                className="bg-white rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {skill.name}
                      </h3>
                      {skill.proficiency && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded capitalize">
                          {skill.proficiency}
                        </span>
                      )}
                    </div>
                    {skill.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {skill.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {skill.category && (
                        <span className="capitalize">{skill.category}</span>
                      )}
                      {skill.yearsOfExperience && (
                        <span>• {skill.yearsOfExperience} years</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/about/skills/edit?rkey=${encodeURIComponent(skill.uri.split('/').pop() || '')}`}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
