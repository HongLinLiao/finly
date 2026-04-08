"use client";

import { ReactNode, useLayoutEffect } from "react";

import useBreadcrumb, { Breadcrumb } from "@/hooks/state/use-breadcrumb";

import MainLayout from "./layout/main-layout";

interface PageProps {
  children?: ReactNode;
  breadcrumbs?: Breadcrumb[];
}

const Page = ({ children, breadcrumbs }: PageProps) => {
  const { setBreadcrumbs } = useBreadcrumb();

  useLayoutEffect(() => {
    setBreadcrumbs(breadcrumbs || []);
  }, [breadcrumbs, setBreadcrumbs]);

  return <MainLayout>{children}</MainLayout>;
};

export default Page;
