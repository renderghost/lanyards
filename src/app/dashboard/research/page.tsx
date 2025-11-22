import { getSession } from '@/lib/auth/session';
import { getAgent } from '@/lib/auth/atproto';
import { ProfileRepository } from '@/lib/data/repository';
import { formatWorkType } from '@/lib/utils';
import { normalizeDOI } from '@/lib/data/doi';
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Pencil, ExternalLink } from 'lucide-react';

export default async function ResearchPage() {
  const session = await getSession();
  const agent = await getAgent();

  if (!session || !agent) {
    return null;
  }

  const repo = new ProfileRepository(agent);
  const works = await repo.listWorks(session.did);

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
              <BreadcrumbPage>Research</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/dashboard/research/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Research
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl font-semibold">Research</h1>
          <p className="text-sm text-muted-foreground">
            Manage your research publications
          </p>
        </div>

        {works.length === 0 ? (
          <Card className="mx-auto w-full max-w-2xl flex flex-col items-center justify-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <CardHeader className="text-center p-0">
              <CardTitle>No research yet</CardTitle>
              <CardDescription>
                Add your first research item by entering its DOI. We&apos;ll
                automatically fetch the metadata from CrossRef.
              </CardDescription>
            </CardHeader>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/research/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Research
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="mx-auto w-full max-w-2xl grid gap-4">
            {works.map((work) => (
              <Card key={work.rkey}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <Link
                        href={`/dashboard/research/edit?rkey=${encodeURIComponent(work.rkey)}`}
                        className="hover:underline"
                      >
                        <CardTitle className="text-base leading-tight">
                          {work.title || work.doi}
                        </CardTitle>
                      </Link>
                      {work.authors && work.authors.length > 0 && (
                        <div className="text-sm text-foreground">
                          {work.authors.join(', ')}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/dashboard/research/edit?rkey=${encodeURIComponent(work.rkey)}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {formatWorkType(work.type)}
                    </Badge>
                    {work.venue && (
                      <span className="text-sm text-foreground">
                        {work.venue}
                      </span>
                    )}
                    {work.publicationDate && (
                      <span className="text-sm text-foreground">
                        {new Date(work.publicationDate).getFullYear()}
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://doi.org/${normalizeDOI(work.doi)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-foreground hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    doi.org/{normalizeDOI(work.doi)}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
