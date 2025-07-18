import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EncryptionController } from "@/services/EncryptionController";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, patientName, penyakit, obat, dokter, ruangan, tanggal } =
      body;

    // Validate required fields
    if (
      !patientId ||
      !patientName ||
      !penyakit ||
      !obat ||
      !dokter ||
      !ruangan
    ) {
      return NextResponse.json(
        { error: "Semua field harus diisi termasuk pasien yang valid" },
        { status: 400 }
      );
    }

    // Use current date if tanggal is not provided or invalid
    const diagnosisDate =
      tanggal && tanggal !== "" ? new Date(tanggal) : new Date();

    // Validate the date
    if (isNaN(diagnosisDate.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid" },
        { status: 400 }
      );
    }

    // Find existing patient - REQUIRED
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json(
        {
          error:
            "Pasien tidak ditemukan. Silakan pilih pasien yang tersedia dari daftar.",
        },
        { status: 404 }
      );
    }

    // Verify patient name matches (additional validation)
    if (patient.fullName.toLowerCase() !== patientName.toLowerCase()) {
      return NextResponse.json(
        {
          error:
            "Data pasien tidak konsisten. Silakan pilih ulang dari daftar.",
        },
        { status: 400 }
      );
    }

    // Create date range for duplicate check (same day)
    const startOfDay = new Date(diagnosisDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(diagnosisDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check for duplicate records
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        patientId: patient.id,
        penyakit: {
          equals: penyakit,
          mode: "insensitive",
        },
        tanggal: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          error: `Data duplikat! ${
            patient.fullName
          } sudah memiliki diagnosis "${penyakit}" pada tanggal ${diagnosisDate.toLocaleDateString(
            "id-ID"
          )}`,
        },
        { status: 409 }
      );
    }

    // Create medical record
    const encryptedData = EncryptionController.encryptMedicalRecord({
      penyakit,
      obat,
      dokter,
      ruangan,
    });
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        ...encryptedData,
        tanggal: diagnosisDate,
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({
      ...medicalRecord,
      ...EncryptionController.decryptMedicalRecord(medicalRecord),
      patientName: medicalRecord.patient.fullName,
      patientDob: medicalRecord.patient.dob.toISOString(),
    });
  } catch (error) {
    console.error("POST /medical-records: Error", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: {
        patient: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    const formattedRecords = records.map((record) => {
      let decrypted = { penyakit: "", obat: "", dokter: "", ruangan: "" };
      try {
        decrypted = EncryptionController.decryptMedicalRecord(record);
      } catch {
        decrypted = {
          penyakit: "[DECRYPT ERROR]",
          obat: "[DECRYPT ERROR]",
          dokter: "[DECRYPT ERROR]",
          ruangan: "[DECRYPT ERROR]",
        };
      }
      return {
        ...record,
        ...decrypted,
        patientName: record.patient.fullName,
        patientDob: record.patient.dob.toISOString(),
      };
    });

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error("GET /medical-records: Error", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
