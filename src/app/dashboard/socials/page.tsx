import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Pencil, ExternalLink } from 'lucide-react';
import { formatDisplayURL } from '@/lib/utils';

const PLATFORM_DISPLAY: Record<string, { label: string; icon: string }> = {
  bluesky: { label: 'Bluesky', icon: '🦋' },
  twitter: { label: 'Twitter/X', icon: '𝕏' },
  linkedin: { label: 'LinkedIn', icon: '💼' },
  mastodon: { label: 'Mastodon', icon: '🐘' },
  researchgate: { label: 'ResearchGate', icon: '🔬' },
  googlescholar: { label: 'Google Scholar', icon: '🎓' },
  orcid: { label: 'ORCID', icon: '🆔' },
  semble: { label: 'Semble', icon: '🩺' },
  other: { label: 'Other', icon: '🔗' },
};

export default async function SocialsPage() {
  const session = await getSession();
  const agent = await getAgent();

  if (!session || !agent) {
    return null;
  }

  const repo = new ProfileRepository(agent);
  const socials = await repo.listSocialLinks(session.did);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Socials</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/dashboard/socials/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Social
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl font-semibold">Social Links</h1>
          <p className="text-sm text-muted-foreground">
            Manage your social media profiles
          </p>
        </div>

        {socials.length === 0 ? (
          <Card className="mx-auto w-full max-w-2xl flex flex-col items-center justify-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardHeader className="text-center p-0">
              <CardTitle>No social links yet</CardTitle>
              <CardDescription>
                Add links to your Bluesky, Twitter, LinkedIn, ORCID, and other
                social profiles.
              </CardDescription>
            </CardHeader>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/socials/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Social Link
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="mx-auto w-full max-w-2xl grid gap-4">
            {socials.map((social) => {
              const platform =
                PLATFORM_DISPLAY[social.platform] || PLATFORM_DISPLAY.other;
              return (
                <Card key={social.rkey}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{platform.icon}</span>
                        <div className="space-y-1 flex-1 min-w-0">
                          <Link
                            href={`/dashboard/socials/edit?rkey=${encodeURIComponent(social.rkey)}`}
                            className="hover:underline"
                          >
                            <CardTitle className="text-base leading-tight">
                              {platform.label}
                            </CardTitle>
                          </Link>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-foreground hover:underline break-all"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {formatDisplayURL(social.url)}
                          </a>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/socials/edit?rkey=${encodeURIComponent(social.rkey)}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
