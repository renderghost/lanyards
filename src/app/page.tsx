import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-linear-to-b from-background to-muted">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight">
          Lanyards
        </h1>
        <p className="text-xl text-foreground mb-2 leading-relaxed">
          Your Researcher Profile on the AT Protocol
        </p>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          An alternative to ORCID for the decentralized web
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth"
            className="bg-primary text-primary-foreground py-3 px-8 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth"
            className="bg-card border-2 border-border text-foreground py-3 px-8 rounded-lg font-medium hover:border-primary/50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2 leading-snug">Mobile-First Design</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Share your profile easily at conferences with QR code support and
              optimized mobile display.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2 leading-snug">Built on AT Protocol</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your data is stored on the AT Protocol, giving you true ownership
              and portability.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2 leading-snug">
              Comprehensive Profile
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Manage affiliations, publications, events, and social networks all
              in one place.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2 leading-snug">DOI Integration</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Add publications by DOI and automatically fetch metadata from
              CrossRef.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
