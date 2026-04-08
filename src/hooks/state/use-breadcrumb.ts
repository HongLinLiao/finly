import { create } from "zustand";

export interface Breadcrumb {
  href?: string;
  label: string;
  active?: boolean;
}

interface BreadcrumbState {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

const useBreadcrumb = create<BreadcrumbState>(set => ({
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => set({ breadcrumbs }),
}));

export default useBreadcrumb;
