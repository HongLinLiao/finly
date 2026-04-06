"use client";

import { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/util/desktop/header";
import Sidebar from "@/components/util/desktop/sidebar";
import Footer from "@/components/util/mobile/footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageProps {
  children: ReactNode;
}

const MainLayout = ({ children }: PageProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="dark relative min-h-screen overflow-hidden bg-black text-zinc-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(82,82,91,0.2),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(63,63,70,0.18),transparent_28%),linear-gradient(180deg,#020202_0%,#090909_48%,#000000_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(63,63,70,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.25)_1px,transparent_1px)] bg-size-[28px_28px]" />
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
      <SidebarInset className="dark relative min-h-screen overflow-hidden bg-black text-zinc-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(82,82,91,0.2),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(63,63,70,0.18),transparent_28%),linear-gradient(180deg,#020202_0%,#090909_48%,#000000_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(63,63,70,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(63,63,70,0.25)_1px,transparent_1px)] bg-size-[28px_28px]" />
        <Header />
        <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
