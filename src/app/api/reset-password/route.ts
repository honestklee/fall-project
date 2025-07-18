import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Gagal reset password" },
      { status: 500 }
    );
  }
}
