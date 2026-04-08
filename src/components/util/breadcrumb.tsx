"use client";

import { FC } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";

import type { Breadcrumb as BreadcrumbData } from "@/hooks/state/use-breadcrumb";

interface BreadcrumbsProps {
  data?: BreadcrumbData[];
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ data = [] }) => {
  const baseTextClass = "text-black dark:text-white";
  const inactiveTextClass = `${baseTextClass} opacity-70`;
  const activeTextClass = `${baseTextClass} font-semibold opacity-100`;

  return (
    <div className="flex items-center gap-2 px-4">
      <SidebarTrigger className="cursor-pointer -ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {data.map((item, idx) => [
            <BreadcrumbItem key={"item-" + idx}>
              {item.href && !item.active ? (
                <BreadcrumbLink
                  className={`hidden transition-opacity ${inactiveTextClass} hover:opacity-100 md:block`}
                  href={item.href}
                >
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className={item.active ? activeTextClass : inactiveTextClass}>
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>,
            idx < data.length - 1 && (
              <BreadcrumbSeparator
                className={`hidden ${inactiveTextClass} md:block`}
                key={"sep-" + idx}
              />
            ),
          ])}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
