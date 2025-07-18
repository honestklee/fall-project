import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { oldPassword, newPassword } = await req.json();

  if (!oldPassword || !newPassword) {
    return NextResponse.json(
      { error: "Semua field wajib diisi" },
      { status: 400 }
    );
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Password baru minimal 6 karakter" },
      { status: 400 }
    );
  }

  // Ambil user dari DB
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json(
      { error: "User tidak ditemukan" },
      { status: 404 }
    );
  }

  // Verifikasi password lama
  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
  }

  // Update password baru
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}
