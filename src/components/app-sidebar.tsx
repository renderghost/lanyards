'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Building2,
  Calendar,
  IdCardLanyard,
  GraduationCap,
  Info,
  Link2,
  LogOut,
  MessageCircleHeart,
  Sparkles,
  Users,
  Zap,
  AtSign,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface AppSidebarProps {
  profile?: {
    handle: string;
    displayName?: string;
    avatar?: string;
    honorific?: string;
  };
  counts?: {
    affiliations: number;
    qualifications: number;
    skills: number;
    events: number;
    works: number;
    socialLinks: number;
    webLinks: number;
  };
}

const aboutItems = [
  {
    title: 'Affiliations',
    url: '/dashboard/about/affiliations',
    icon: Building2,
    countKey: 'affiliations' as const,
  },
  {
    title: 'Qualifications',
    url: '/dashboard/about/qualifications',
    icon: GraduationCap,
    countKey: 'qualifications' as const,
  },
  {
    title: 'Skills',
    url: '/dashboard/about/skills',
    icon: Zap,
    countKey: 'skills' as const,
  },
];

const linksItems = [
  {
    title: 'Research',
    url: '/dashboard/research',
    icon: BookOpen,
    countKey: 'works' as const,
  },
  {
    title: 'Events',
    url: '/dashboard/events',
    icon: Calendar,
    countKey: 'events' as const,
  },
  {
    title: 'Socials',
    url: '/dashboard/socials',
    icon: Users,
    countKey: 'socialLinks' as const,
  },
  {
    title: 'Links',
    url: '/dashboard/links',
    icon: Link2,
    countKey: 'webLinks' as const,
  },
];

const supportItems = [
  {
    title: 'Documentation',
    url: 'https://github.com/renderghost/lanyards/wiki/',
    icon: Info,
    external: true,
  },
  {
    title: 'Signal Group',
    url: 'https://signal.group/#CjQKII7UrdZwfftsYT2F7w0zKkFaudDblsBRc2eLpgpP3m-CEhAhjk2AnC2hvLLOFYBrcBe-',
    icon: MessageCircleHeart,
    external: true,
  },
  {
    title: 'Connect on Bluesky',
    url: 'https://bsky.app/profile/lanyards.app',
    icon: AtSign,
    external: true,
  },
];

export function AppSidebar({ profile, counts }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Image
                  src="/logo-light.svg"
                  alt="Lanyards"
                  width={32}
                  height={32}
                  className="block rounded-lg dark:hidden"
                />
                <Image
                  src="/logo-dark.svg"
                  alt="Lanyards"
                  width={32}
                  height={32}
                  className="hidden rounded-lg dark:block"
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Lanyards</span>
                    <Badge variant="secondary" className="w-fit beta-badge">
                      BETA
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground leading-none">
                    {profile?.handle ? `Linking Researchers` : 'Dashboard'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                <Link href="/dashboard">
                  <Sparkles />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {profile?.handle && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/${profile.handle}`} target="_blank">
                    <IdCardLanyard />
                    <span>View Lanyard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* About Section */}
        <SidebarGroup>
          <SidebarGroupLabel>About</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aboutItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {counts && counts[item.countKey] > 0 && (
                    <Badge
                      variant="outline"
                      className="pointer-events-none absolute right-1 top-1.5 h-5 min-w-5 justify-center px-1 tabular-nums group-data-[collapsible=icon]:hidden"
                    >
                      {counts[item.countKey]}
                    </Badge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Links Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {linksItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {counts && counts[item.countKey] > 0 && (
                    <Badge
                      variant="outline"
                      className="pointer-events-none absolute right-1 top-1.5 h-5 min-w-5 justify-center px-1 tabular-nums group-data-[collapsible=icon]:hidden"
                    >
                      {counts[item.countKey]}
                    </Badge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support Section */}
        <SidebarGroup>
          <SidebarGroupLabel>BETA Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} target="_blank" rel="noopener noreferrer">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action="/api/auth/logout" method="POST" className="w-full">
              <SidebarMenuButton type="submit" className="w-full">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
