import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const url = req.nextUrl.pathname;
      if (url.startsWith("/dashboard/admin/account-admins"))
        return token?.role === "SUPER_ADMIN";
      if (url.startsWith("/dashboard/admin"))
        return token?.role === "ADMIN" || token?.role === "SUPER_ADMIN";
      if (url.startsWith("/dashboard/patient"))
        return token?.role === "PATIENT";
      return !!token;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export default function middleware(req: NextRequest) {
  const isApi = req.nextUrl.pathname.startsWith("/api");
  const token =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");
  if (isApi && !token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // Tambahkan argumen kedua (event) agar tidak error
  return (authMiddleware as any)(req, {});
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/accounts/:path*",
    "/api/admins/:path*",
    "/api/medical-records/:path*",
    "/api/patients/:path*",
    "/api/sensor-data/:path*",
    "/api/superadmin/:path*",
    "/api/create-patient",
    "/api/log-accident/:path*",
  ],
};
