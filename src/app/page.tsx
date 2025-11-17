import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Lanyards
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          Your Researcher Profile on the AT Protocol
        </p>
        <p className="text-lg text-gray-600 mb-8">
          An alternative to ORCID for the decentralized web
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth"
            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth"
            className="bg-white border-2 border-gray-300 text-gray-700 py-3 px-8 rounded-lg font-medium hover:border-gray-400 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Mobile-First Design</h3>
            <p className="text-gray-600 text-sm">
              Share your profile easily at conferences with QR code support and
              optimized mobile display.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Built on AT Protocol</h3>
            <p className="text-gray-600 text-sm">
              Your data is stored on the AT Protocol, giving you true ownership
              and portability.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">
              Comprehensive Profile
            </h3>
            <p className="text-gray-600 text-sm">
              Manage affiliations, publications, events, and social networks all
              in one place.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">DOI Integration</h3>
            <p className="text-gray-600 text-sm">
              Add publications by DOI and automatically fetch metadata from
              CrossRef.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
