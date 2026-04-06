"use client";

import { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/util/desktop/header";
import Sidebar from "@/components/util/desktop/sidebar";
import Footer from "@/components/util/mobile/footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageProps {
  children: ReactNode;
  isShowHeader?: boolean;
}

const MainLayout = ({ children, isShowHeader = true }: PageProps) => {
  const isMobile = useIsMobile();

  if (!isShowHeader) {
    return (
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground dark:bg-black dark:text-zinc-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_86%_0%,rgba(13,148,136,0.1),transparent_26%),linear-gradient(180deg,#f8fcfa_0%,#f4faf7_52%,#eef7f2_100%)] dark:bg-[radial-gradient(circle_at_15%_10%,rgba(82,82,91,0.2),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(63,63,70,0.18),transparent_28%),linear-gradient(180deg,#020202_0%,#090909_48%,#000000_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(16,94,78,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,94,78,0.08)_1px,transparent_1px)] bg-size-[28px_28px] dark:opacity-[0.08] dark:bg-[linear-gradient(rgba(63,63,70,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.25)_1px,transparent_1px)]" />
        <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground dark:bg-black dark:text-zinc-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_86%_0%,rgba(13,148,136,0.1),transparent_26%),linear-gradient(180deg,#f8fcfa_0%,#f4faf7_52%,#eef7f2_100%)] dark:bg-[radial-gradient(circle_at_15%_10%,rgba(82,82,91,0.2),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(63,63,70,0.18),transparent_28%),linear-gradient(180deg,#020202_0%,#090909_48%,#000000_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(16,94,78,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,94,78,0.08)_1px,transparent_1px)] bg-size-[28px_28px] dark:opacity-[0.08] dark:bg-[linear-gradient(rgba(63,63,70,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.25)_1px,transparent_1px)]" />
        <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_86%_0%,rgba(13,148,136,0.1),transparent_26%),linear-gradient(180deg,#f8fcfa_0%,#f4faf7_52%,#eef7f2_100%)] dark:bg-[radial-gradient(circle_at_15%_10%,rgba(82,82,91,0.2),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(63,63,70,0.18),transparent_28%),linear-gradient(180deg,#020202_0%,#090909_48%,#000000_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(16,94,78,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,94,78,0.08)_1px,transparent_1px)] bg-size-[28px_28px] dark:opacity-[0.08] dark:bg-[linear-gradient(rgba(63,63,70,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.25)_1px,transparent_1px)]" />
        <Header />
        <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
