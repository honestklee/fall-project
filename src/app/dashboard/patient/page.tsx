import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { FaHospital } from "react-icons/fa";
import PaginationControls from "./PaginationControls";
import { EncryptionController } from "@/services/EncryptionController";
import ProfileMenu from "@/components/ProfileMenu";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function PatientDashboard(props: {
  searchParams: { page?: string };
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);
  const currentPage = Number(searchParams.page) || 1;
  const recordsPerPage = 5;

  const totalRecords = await prisma.medicalRecord.count({
    where: { patient: { user: { email: session?.user?.email! } } },
  });

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const medicalRecords = await prisma.medicalRecord.findMany({
    where: { patient: { user: { email: session?.user?.email! } } },
    orderBy: { tanggal: "desc" },
    skip: (currentPage - 1) * recordsPerPage,
    take: recordsPerPage,
  });

  const decryptedRecords = medicalRecords.map((record) => ({
    ...record,
    ...EncryptionController.decryptMedicalRecord(record),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              MY MEDICAL RECORDS
            </h1>
          </div>
          <p className="text-sm text-purple-300/70 mt-1">
            Welcome back, {session?.user?.email}
          </p>
        </div>
        <ProfileMenu
          user={{
            name: session?.user?.name ?? undefined,
            email: session?.user?.email ?? undefined,
            role: session?.user?.role ?? undefined,
            profilePhotoUrl: session?.user?.profilePhotoUrl ?? undefined,
            noHp: session?.user?.noHp ?? undefined,
          }}
        />
      </div>

      <div className="bg-black/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/20 p-6">
        {decryptedRecords.length === 0 ? (
          <p className="text-center text-purple-300/70">
            You don't have any medical records yet.
          </p>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="p-3 text-left text-purple-300">Penyakit</th>
                    <th className="p-3 text-left text-purple-300">Obat</th>
                    <th className="p-3 text-left text-purple-300">Dokter</th>
                    <th className="p-3 text-left text-purple-300">Ruangan</th>
                    <th className="p-3 text-left text-purple-300">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {decryptedRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-purple-500/10 hover:bg-purple-500/5"
                    >
                      <td className="p-3 text-white">{record.penyakit}</td>
                      <td className="p-3 text-white">{record.obat}</td>
                      <td className="p-3 text-white">{record.dokter}</td>
                      <td className="p-3 text-white">{record.ruangan}</td>
                      <td className="p-3 text-white">
                        {formatDate(record.tanggal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
