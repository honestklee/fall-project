import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditRecord({
  params,
}: {
  params: { id: string };
}) {
  const record = await prisma.medicalRecord.findUnique({
    where: { id: params.id },
    include: { patient: true },
  });

  if (!record) return <div>Data tidak ditemukan.</div>;

  async function updateRecord(formData: FormData) {
    "use server";

    const data = {
      penyakit: formData.get("penyakit") as string,
      obat: formData.get("obat") as string,
      dokter: formData.get("dokter") as string,
      ruangan: formData.get("ruangan") as string,
      tanggal: new Date(formData.get("tanggal") as string),
    };

    await prisma.medicalRecord.update({
      where: { id: params.id },
      data,
    });

    redirect("/dashboard/admin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-white">
            Edit Data Rekam Medis
          </h1>
        </div>

        <form
          action={updateRecord}
          className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20 p-6"
        >
          <p className="mb-4 text-purple-300">
            Pasien:{" "}
            <span className="text-white">{record.patient.fullName}</span>
          </p>

          <input
            name="penyakit"
            defaultValue={record.penyakit}
            placeholder="Penyakit"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <input
            name="obat"
            defaultValue={record.obat}
            placeholder="Obat"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <input
            name="dokter"
            defaultValue={record.dokter}
            placeholder="Dokter"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <input
            name="ruangan"
            defaultValue={record.ruangan}
            placeholder="Ruangan"
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <input
            name="tanggal"
            type="date"
            defaultValue={record.tanggal.toISOString().split("T")[0]}
            className="w-full p-2 border border-purple-500/20 bg-black/40 text-white mb-3 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-2 rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
          >
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
}
