"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import SidebarClient from "./SidebarClient";
import { usePathname } from "next/navigation";
import SessionExpiredModal from "./SessionExpiredModal";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const pathname = usePathname();

  // black list dari sidebar cok
  const hiddenRoutes = ["/reset-password", "/login"];
  const hideSidebar = hiddenRoutes.includes(pathname);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full grid bg-gradient-to-br from-gray-900 to-purple-900"
      style={{
        gridTemplateColumns: !hideSidebar && role ? "256px 1fr" : "1fr",
        gap: 0,
      }}
    >
      {!hideSidebar && role && <SidebarClient role={role} />}
      <main className="overflow-auto p-6">{children}</main>
      <SessionExpiredModal />
    </div>
  );
}
