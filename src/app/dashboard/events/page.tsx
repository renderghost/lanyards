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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Pencil, MapPin, ExternalLink } from 'lucide-react';
import { formatDateUS, formatDisplayURL } from '@/lib/utils';

export default async function EventsPage() {
  const session = await getSession();
  const agent = await getAgent();

  if (!session || !agent) {
    return null;
  }

  const repo = new ProfileRepository(agent);
  const events = await repo.listEvents(session.did);

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
              <BreadcrumbPage>Events</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/dashboard/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Manage conferences, workshops, and seminars
          </p>
        </div>

        {events.length === 0 ? (
          <Card className="mx-auto w-full max-w-2xl flex flex-col items-center justify-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <CardHeader className="text-center p-0">
              <CardTitle>No events yet</CardTitle>
              <CardDescription>
                Add upcoming conferences, workshops, or seminars you&apos;re
                attending or have attended.
              </CardDescription>
            </CardHeader>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="mx-auto w-full max-w-2xl grid gap-4">
            {events.map((event) => {
              const startDate = new Date(event.startDate);
              const endDate = event.endDate ? new Date(event.endDate) : null;
              const isUpcoming = startDate > new Date();

              return (
                <Card key={event.rkey}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/events/edit?rkey=${encodeURIComponent(event.rkey)}`}
                            className="hover:underline"
                          >
                            <CardTitle className="text-base leading-tight">
                              {event.name}
                            </CardTitle>
                          </Link>
                          {isUpcoming && (
                            <Badge variant="default">Upcoming</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDateUS(event.startDate)}
                          {endDate &&
                          endDate.getTime() !== startDate.getTime()
                            ? ` - ${formatDateUS(event.endDate!)}`
                            : ''}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/events/edit?rkey=${encodeURIComponent(event.rkey)}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {event.location && (
                        <span className="inline-flex items-center gap-1 text-sm text-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location.city && `${event.location.city}, `}
                          {event.location.country}
                        </span>
                      )}
                      <Badge variant="secondary" className="capitalize">
                        {event.type.replace(/-/g, ' ')}
                      </Badge>
                    </div>
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-foreground hover:underline mt-2"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {formatDisplayURL(event.url)}
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
