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
import { Zap, Plus, Pencil } from 'lucide-react';

export default async function SkillsPage() {
  const session = await getSession();
  const agent = await getAgent();

  if (!session || !agent) {
    return null;
  }

  const repo = new ProfileRepository(agent);
  const skills = await repo.listSkills(session.did);

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
              <BreadcrumbPage>Skills</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/dashboard/about/skills/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl font-semibold">Skills</h1>
          <p className="text-sm text-muted-foreground">
            Manage your professional and technical skills
          </p>
        </div>

        {skills.length === 0 ? (
          <Card className="mx-auto w-full max-w-2xl flex flex-col items-center justify-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <CardHeader className="text-center p-0">
              <CardTitle>No skills yet</CardTitle>
              <CardDescription>
                Add your technical, professional, and research skills to
                showcase your expertise.
              </CardDescription>
            </CardHeader>
            <Button className="mt-6" asChild>
              <Link href="/dashboard/about/skills/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="mx-auto w-full max-w-2xl grid gap-4">
            {skills.map((skill) => (
              <Card key={skill.uri}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/about/skills/edit?rkey=${encodeURIComponent(skill.uri.split('/').pop() || '')}`}
                        >
                          <CardTitle className="text-base leading-tight">
                            {skill.name}
                          </CardTitle>
                        </Link>
                        {skill.proficiency && (
                          <Badge variant="secondary" className="capitalize">
                            {skill.proficiency}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/dashboard/about/skills/edit?rkey=${encodeURIComponent(skill.uri.split('/').pop() || '')}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                    {skill.category && (
                      <span className="capitalize">{skill.category}</span>
                    )}
                    {skill.yearsOfExperience && (
                      <span>• {skill.yearsOfExperience} years</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
