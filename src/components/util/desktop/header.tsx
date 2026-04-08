"use client";

import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import useBreadcrumb from "@/hooks/state/use-breadcrumb";

import { Breadcrumbs } from "../breadcrumb";

const Header = () => {
  const { breadcrumbs } = useBreadcrumb();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <Breadcrumbs data={breadcrumbs} />
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="cursor-pointer" aria-label="搜尋">
            <Search className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="cursor-pointer" aria-label="通知">
            <Bell className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
