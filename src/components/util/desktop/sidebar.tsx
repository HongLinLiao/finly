"use client";

import {
  ChartCandlestick,
  ChevronRight,
  HandCoins,
  House,
  Settings,
  Building2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  className?: string;
}

const DESKTOP_MENU = [
  { title: "首頁", icon: House, href: "/" },
  { title: "股票", icon: ChartCandlestick, href: "/stocks" },
  { title: "基金", icon: HandCoins, href: "/funds" },
  {
    title: "設定",
    icon: Settings,
    items: [{ title: "證券戶設定", href: "/brokerages", icon: Building2 }],
  },
] as const;

const DesktopSidebar = ({ className }: DesktopSidebarProps) => {
  const pathname = usePathname();

  const isActiveHref = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar className={cn("group-data-[side=left]:border-r-0", className)} collapsible="offcanvas">
      <SidebarHeader className="px-3 py-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl border border-border/80 bg-card/95 px-3 py-2 transition hover:border-primary/35 hover:bg-secondary/80 dark:border-white/10 dark:bg-zinc-900/70 dark:hover:border-white/20 dark:hover:bg-zinc-800/80"
        >
          <Image
            src="/logo.png"
            alt="Finly logo"
            width={30}
            height={30}
            className="h-7 w-7 rounded-md"
            priority
          />
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold tracking-[0.01em] text-foreground dark:text-zinc-100">
              Finly
            </span>
            {/* <span className="text-[11px] text-zinc-400">Personal Finance</span> */}
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="gap-1 px-1">
          {/* <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-[0.08em] text-zinc-500 uppercase">
            Navigation
          </SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {DESKTOP_MENU.map(item => {
                if ("items" in item) {
                  const isActive = item.items.some(child => isActiveHref(child.href));

                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={isActive} className="h-10 rounded-xl">
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map(child => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActiveHref(child.href)}
                                  className="h-8"
                                >
                                  <Link href={child.href}>
                                    <child.icon />
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveHref(item.href)}
                      className="h-10 rounded-xl"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter className="px-4 py-3 text-xs">
        <div className="flex items-center justify-between">
          <span>Finly Dashboard</span>
          <span className="inline-flex h-2 w-2 rounded-full bg-primary/70" aria-hidden />
        </div>
      </SidebarFooter> */}
    </Sidebar>
  );
};

export default DesktopSidebar;
