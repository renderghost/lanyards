import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Building2,
  Users,
  Sparkles,
  Globe,
  Zap,
  Maximize2,
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-6 py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl w-full text-center space-y-6">
          {/* Logo and Beta Badge */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Image
              src="/logo-light.svg"
              alt="Lanyards"
              width={96}
              height={96}
              className="block dark:hidden"
            />
            <Image
              src="/logo-dark.svg"
              alt="Lanyards"
              width={96}
              height={96}
              className="hidden dark:block"
            />
            <Badge variant="secondary" className="beta-badge text-sm">
              BETA
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Welcome to Lanyards
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The curated link for academic researchers that collects your complete scholarly presence—publications, talks, affiliations, and social profiles.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="https://docs.lanyards.app/" target="_blank">
                Learn More
              </Link>
            </Button>
          </div>

          {/* Desktop: Phone Mockup with Embedded Profile */}
          <div className="hidden md:flex flex-col items-center gap-4 pt-8">
            <div
              className="relative bg-background rounded-[2.5rem] overflow-hidden shadow-2xl"
              style={{
                width: '375px',
                height: '667px',
                border: '12px solid hsl(0 0% 10%)',
                borderTopWidth: '20px',
                borderBottomWidth: '20px',
              }}
            >
              <iframe
                src="/renderg.host"
                className="w-full h-full border-0"
                title="Example Lanyard Profile"
              />
            </div>
            <Link
              href="/renderg.host"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground leading-normal"
            >
              <Maximize2 className="h-4 w-4" />
              View Sample Profile
            </Link>
          </div>

          {/* Mobile: Example Link */}
          <div className="md:hidden pt-4">
            <Link
              href="/renderg.host"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground leading-normal"
            >
              <Maximize2 className="h-4 w-4" />
              View Sample Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="bg-muted/50 px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              The visibility paradox
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Career progression demands comprehensive online presence, but
              maintaining it is administratively overwhelming.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  Scattered presence
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                ORCID for publications, ResearchGate for networking, personal
                website for informal work, Twitter for visibility, conference
                sites for talks—each needs manual updates.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  Missing context
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Informal work like preprints, datasets, ongoing projects, and
                social engagement doesn't fit existing academic infrastructure.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  Constant maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Time spent updating multiple platforms is time not spent on
                research. Each change requires logging into different systems.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  No single truth
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                There's no single place that represents your complete, current
                scholarly identity when opportunities arise.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              One link, everything visible
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Lanyards pulls together your complete scholarly presence with zero
              maintenance overhead.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="homepage-icon-wrapper">
                  <Building2 className="h-8 w-8 mb-2" />
                </div>
                <CardTitle className="text-base leading-snug">
                  Professional identity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Affiliations, qualifications, and skills presented with proper
                academic aesthetic.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="homepage-icon-wrapper">
                  <BookOpen className="h-8 w-8 mb-2" />
                </div>
                <CardTitle className="text-base leading-snug">
                  Research outputs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Publications, talks, and events—both formal and informal
                contributions.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="homepage-icon-wrapper">
                  <Users className="h-8 w-8 mb-2" />
                </div>
                <CardTitle className="text-base leading-snug">
                  Social presence
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Connect all your academic and social profiles in one place.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="homepage-icon-wrapper">
                  <Sparkles className="h-8 w-8 mb-2" />
                </div>
                <CardTitle className="text-base leading-snug">
                  Auto-ingestion
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Connect ORCID, Google Scholar—publications appear automatically.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="homepage-icon-wrapper">
                  <Zap className="h-8 w-8 mb-2" />
                </div>
                <CardTitle className="text-base leading-snug">
                  Your control
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Pin important work, organize by collections, hide what's not
                relevant.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="homepage-icon-wrapper">
                  <Globe className="h-8 w-8 mb-2" />
                </div>
                <CardTitle className="text-base leading-snug">
                  AT Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Decentralized, open, yours—no platform lock-in or data silos.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-muted/50 px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Built for researchers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Powerful tools designed for academic needs, not corporate
              networking.
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  Less admin, more research
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Update once, share everywhere. No more Sunday afternoons updating
                ten different websites or managing multiple link collections.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  Complete visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                New connections see the full scope of your work immediately—from
                formal publications to informal contributions that drive real
                connections.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  Career continuity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Your research identity stays with you across institutions. No more
                losing control when changing positions.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-snug">
                  Open infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Built on AT Protocol—transparent, inspectable, and aligned with
                academic values of openness and reusability.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Ready to simplify your research presence?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join researchers building their professional identity on open
            infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/auth">Create Your Lanyard</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link
                href="https://bsky.app/profile/lanyards.app"
                target="_blank"
              >
                Follow on Bluesky
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground leading-normal">
            Built on the AT Protocol
          </p>
          <div className="flex gap-6">
            <Link
              href="https://docs.lanyards.app/"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground leading-normal"
            >
              Documentation
            </Link>
            <Link
              href="https://github.com/renderghost/lanyards"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground leading-normal"
            >
              GitHub
            </Link>
            <Link
              href="https://bsky.app/profile/renderg.host"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground leading-normal"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
