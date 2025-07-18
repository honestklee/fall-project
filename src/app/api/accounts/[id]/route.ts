import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// PUT: Update akun pasien
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { fullName, email, address, dob, password, noHp } = body;
    const userId = params.id;

    if (!fullName || !email || !dob) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Cek apakah user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Akun pasien tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      email,
      noHp,
      patient: {
        update: {
          fullName,
          address,
          dob: new Date(dob),
        },
      },
    };

    // Jika password diisi, hash dan update
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { patient: true },
    });

    return NextResponse.json({
      success: true,
      message: "Akun pasien berhasil diperbarui!",
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.patient?.fullName,
        address: updatedUser.patient?.address,
        dob: updatedUser.patient?.dob,
      },
    });
  } catch (error) {
    console.error("Gagal update akun pasien:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui akun pasien" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus akun pasien
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Cek apakah user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Akun pasien tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus user (patient akan terhapus otomatis karena cascade)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "Akun pasien berhasil dihapus!",
    });
  } catch (error) {
    console.error("Gagal hapus akun pasien:", error);
    return NextResponse.json(
      { error: "Gagal menghapus akun pasien" },
      { status: 500 }
    );
  }
}
