import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accidents = await prisma.accident.findMany({
      orderBy: { createdAt: "desc" },
      include: { patient: true }, // <-- tambahkan ini!
    });
    // Kirim nama pasien di response
    const result = accidents.map((a) => ({
      ...a,
      patientName: a.patient?.fullName || "-",
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data accident" },
      { status: 500 }
    );
  }
}

// Tambahkan handler POST di bawah ini
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Pastikan semua field required ada
    if (
      !body.patientId ||
      !body.petugasPencatatId ||
      !body.tanggalKejadian ||
      !body.lokasi ||
      !body.kronologi ||
      typeof body.sudahDitangani !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const accident = await prisma.accident.create({
      data: {
        patientId: body.patientId,
        petugasPencatatId: body.petugasPencatatId,
        tanggalKejadian: new Date(body.tanggalKejadian),
        lokasi: body.lokasi,
        kronologi: body.kronologi,
        sudahDitangani: body.sudahDitangani,
        penanganan: body.penanganan,
        kondisiPatient: body.kondisiPatient,
        hasilPengecekan: body.hasilPengecekan,
        catatanTambahan: body.catatanTambahan,
        ditanganiOleh: body.ditanganiOleh,
      },
    });
    return NextResponse.json(accident, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan accident:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data accident" },
      { status: 500 }
    );
  }
}

// TODO: Buat dynamic route /api/log-accident/[id]/route.ts untuk handle DELETE dan EDIT log-accident by id
