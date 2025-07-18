import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      fullName: true,
      dob: true,
    },
  });

  return NextResponse.json(
    patients.map((p) => ({
      ...p,
      dob: p.dob.toISOString(),
    }))
  );
}
