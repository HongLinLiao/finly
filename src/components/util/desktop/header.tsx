"use client";

import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Header = () => {
  return (
    <header className="sticky top-0 z-30 bg-black/70 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2.5">
          <SidebarTrigger className="cursor-pointer text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100" />
          <span className="text-sm font-semibold tracking-[0.02em] text-zinc-100">Dashboard</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100"
            aria-label="搜尋"
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100"
            aria-label="通知"
          >
            <Bell className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
