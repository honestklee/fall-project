"use client";

import { SessionProvider } from "next-auth/react";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { ReactNode } from "react";

// FontAwesome fix
config.autoAddCss = false;

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>; // ✅ session context provided
}
