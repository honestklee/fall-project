import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json(
      { error: "File tidak ditemukan" },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "File harus berupa gambar" },
      { status: 400 }
    );
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 2MB" },
      { status: 400 }
    );
  }

  // Ambil user dari database
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  //   Hapus file foto lama jika ada
  if (user?.profilePhotoUrl) {
    const oldPath = path.join(process.cwd(), "public", user.profilePhotoUrl);
    try {
      await unlink(oldPath);
    } catch (err) {
      // File mungkin sudah tidak ada,untuk menghindari error
    }
  }

  // Simpan foto baru
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${session.user.id}_${Date.now()}.${
    file.type.split("/")[1]
  }`;
  const filePath = path.join(
    process.cwd(),
    "public",
    "profile-photos",
    filename
  );

  await writeFile(filePath, buffer);

  // Update database dengan URL baru
  const photoUrl = `/profile-photos/${filename}`;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { profilePhotoUrl: photoUrl },
  });

  return NextResponse.json({ success: true, url: photoUrl });
}
