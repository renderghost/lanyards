'use client';

import ResearchForm from './ResearchForm';
import Link from 'next/link';
import type { Work } from '@/types';

interface EditResearchClientProps {
  work: Work & { rkey: string };
}

export default function EditResearchClient({ work }: EditResearchClientProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/research"
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
          <h1 className="text-xl font-bold">Edit Research</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update research details
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <ResearchForm mode="edit" initialData={work} />
      </div>
    </main>
  );
}
