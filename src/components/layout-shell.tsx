"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/nav";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/account-setup";

  return (
    <>
      <Nav />
      <div className={hideNav ? undefined : "pt-16"}>{children}</div>
    </>
  );
}
