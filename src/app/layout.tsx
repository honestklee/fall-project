import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "Hospital System",
  description: "Admin & Patient Medical Record Dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gradient-to-br from-gray-900 to-purple-900 m-0 p-0">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
