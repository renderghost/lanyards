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
import { Globe, Plus, Pencil, ExternalLink } from 'lucide-react';
import { formatDisplayURL } from '@/lib/utils';

export default async function LinksPage() {
  const session = await getSession();
  const agent = await getAgent();

  if (!session || !agent) {
    return null;
  }

  const repo = new ProfileRepository(agent);
  const links = await repo.listWebLinks(session.did);

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
              <BreadcrumbPage>Links</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/dashboard/links/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl font-semibold">Web Links</h1>
          <p className="text-sm text-muted-foreground">
            Manage your custom web links
          </p>
        </div>

        {links.length === 0 ? (
          <Card className="mx-auto w-full max-w-2xl flex flex-col items-center justify-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <CardHeader className="text-center p-0">
              <CardTitle>No links yet</CardTitle>
              <CardDescription>
                Add links to your personal website, portfolio, or other web
                pages.
              </CardDescription>
            </CardHeader>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/links/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Link
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="mx-auto w-full max-w-2xl grid gap-4">
            {links.map((link) => (
              <Card key={link.rkey}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Globe className="h-5 w-5 text-foreground shrink-0" />
                      <div className="space-y-1 flex-1 min-w-0">
                        <Link
                          href={`/dashboard/links/edit?rkey=${encodeURIComponent(link.rkey)}`}
                        >
                          <CardTitle className="text-base leading-tight">
                            {link.title || 'Web Link'}
                          </CardTitle>
                        </Link>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm break-all leading-normal"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          {formatDisplayURL(link.url)}
                        </a>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/dashboard/links/edit?rkey=${encodeURIComponent(link.rkey)}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
