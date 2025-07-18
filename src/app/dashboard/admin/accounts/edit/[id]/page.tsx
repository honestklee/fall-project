import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditAccount({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { patient: true },
  });

  if (!user || !user.patient) return <div>Data pasien tidak ditemukan.</div>;

  async function updateAccount(formData: FormData) {
    "use server";

    const fullName = formData.get("fullName") as string;
    const address = formData.get("address") as string;
    const dob = new Date(formData.get("dob") as string);
    const noHp = formData.get("noHp") as string;

    // Update data pasien
    await prisma.patient.update({
      where: { id: user!.patient!.id },
      data: { fullName, address, dob },
    });

    // Update nomor HP di User
    await prisma.user.update({
      where: { id: user!.id },
      data: { noHp },
    });

    redirect("/dashboard/admin/accounts");
  }

  return (
    <form
      action={updateAccount}
      className="max-w-xl mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4">Edit Akun Pasien</h2>

      <input
        name="fullName"
        defaultValue={user.patient.fullName}
        placeholder="Nama Lengkap"
        className="w-full p-2 border mb-3 rounded"
        required
      />
      <input
        name="address"
        defaultValue={user.patient.address}
        placeholder="Alamat"
        className="w-full p-2 border mb-3 rounded"
        required
      />
      <input
        name="dob"
        type="date"
        defaultValue={user.patient.dob.toISOString().split("T")[0]}
        className="w-full p-2 border mb-3 rounded"
        required
      />
      <input
        type="text"
        name="noHp"
        defaultValue={user.noHp ?? ""}
        placeholder="Nomor HP"
        className="w-full p-2 border mb-3 rounded"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Simpan Perubahan
      </button>
    </form>
  );
}
