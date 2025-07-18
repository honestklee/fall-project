import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cari user dan relasi ke patient
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { patient: true },
  });

  if (!user?.patient) {
    return NextResponse.json(
      { error: "Pasien tidak ditemukan" },
      { status: 404 }
    );
  }

  const accidents = await prisma.accident.findMany({
    where: { patientId: user.patient.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(accidents);
}
