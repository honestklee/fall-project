import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { EncryptionController } from "@/services/EncryptionController";

// DELETE rekam medis by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    await prisma.medicalRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal hapus rekam medis" },
      { status: 500 }
    );
  }
}

// PATCH rekam medis by ID
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await req.json();

  const { penyakit, obat, dokter, ruangan, tanggal } = body;

  try {
    const encryptedData = EncryptionController.encryptMedicalRecord({
      penyakit,
      obat,
      dokter,
      ruangan,
    });
    const updated = await prisma.medicalRecord.update({
      where: { id },
      data: {
        ...encryptedData,
        tanggal: new Date(tanggal),
      },
    });

    return NextResponse.json({
      ...updated,
      ...EncryptionController.decryptMedicalRecord(updated),
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}
