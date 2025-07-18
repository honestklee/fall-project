import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔍 Attempting login with:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          // Cari user di db
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { patient: true },
          });

          console.log("👤 User found:", user ? "Yes" : "No");
          if (user) {
            console.log("📋 User role:", user.role);
            console.log(
              "🔐 Stored password hash:",
              user.password.substring(0, 10) + "..."
            );
          }

          if (!user) {
            console.log("❌ User not found");
            return null;
          }

          // Cek pw
          const isValid = await compare(credentials.password, user.password);
          console.log("🔐 Password valid:", isValid);

          if (!isValid) {
            console.log("❌ Invalid password");
            return null;
          }

          // Konversi ke WIB
          const now = new Date();
          const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: wib },
          });

          console.log("✅ Login successful");
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            noHp: user.noHp,
            name: user.patient?.fullName || user.fullName || "",
            fullName: user.fullName || "",
            position: user.position || "",
            profilePhotoUrl: user.profilePhotoUrl || "",
          };
        } catch (error) {
          console.error("💥 Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login", // redirect ke login
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.noHp = (user as any).noHp;
        token.name = (user as any).name;
        token.profilePhotoUrl = (user as any).profilePhotoUrl;
        token.fullName = (user as any).fullName;
        token.position = (user as any).position;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.noHp = token.noHp as string;
        session.user.name = token.name as string;
        session.user.profilePhotoUrl = token.profilePhotoUrl as string;
        session.user.fullName = token.fullName as string;
        session.user.position = token.position as string;
      }
      return session;
    },
  },
};
