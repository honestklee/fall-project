import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendAdminAccountEmail } from "@/lib/email";

export async function GET() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      email: true,
      fullName: true,
      noHp: true,
      position: true,
      lastLogin: true,
    },
  });
  return NextResponse.json(admins);
}

export async function POST(req: Request) {
  const { email, password, fullName, noHp, position } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email sudah digunakan" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: "ADMIN",
      fullName,
      noHp,
      position,
      lastLogin: null,
    },
  });

  const resetLink = `http://localhost:3000/reset-password?email=${encodeURIComponent(email)}`;
  await sendAdminAccountEmail({ to: email, email, resetLink });

  return NextResponse.json(user);
}
