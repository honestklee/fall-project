import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      noHp?: string | null;
      profilePhotoUrl?: string | null;
      fullName?: string;
      position?: string;
    };
  }
}
