import { ReactNode } from "react";

import MainLayout from "./layout/main-layout";

interface PageProps {
  children: ReactNode;
}

const Page = ({ children }: PageProps) => {
  return <MainLayout>{children}</MainLayout>;
};

export default Page;
