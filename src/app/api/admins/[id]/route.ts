import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { email, password, fullName, noHp, position } = await req.json();

  try {
    const data: any = {};
    if (email) data.email = email;
    if (fullName) data.fullName = fullName;
    if (noHp) data.noHp = noHp;
    if (position) data.position = position;
    if (password && password.length > 0) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update admin" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}
