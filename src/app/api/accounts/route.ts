import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET: Ambil semua akun pasien
export async function GET() {
  const accounts = await prisma.user.findMany({
    where: { role: "PATIENT" },
    include: { patient: true },
  });

  const result = accounts.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.patient?.fullName ?? "-",
    address: u.patient?.address ?? "-",
    dob: u.patient?.dob ?? "-",
    noHp: u.noHp ?? "",
  }));

  return NextResponse.json(result);
}

// POST: Tambah akun pasien baru
export async function POST(request: Request) {
  const body = await request.json();
  const { fullName, email, address, dob, password, noHp } = body;

  if (!fullName || !email || !dob || !password) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "PATIENT",
        noHp,
        patient: {
          create: {
            fullName,
            address,
            dob: new Date(dob),
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Akun pasien berhasil ditambahkan!",
        data: {
          email,
          password: "[TERENKRIPSI]",
          fullName,
          address,
          dob,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal tambah akun pasien:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan pasien" },
      { status: 500 }
    );
  }
}
