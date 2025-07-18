"use client";
import { useEffect, useState } from "react";

interface Accident {
  id: string;
  tanggalKejadian: string;
  lokasi: string;
  kronologi: string;
  sudahDitangani: boolean;
  penanganan?: string;
  kondisiPatient?: string;
  hasilPengecekan?: string;
  catatanTambahan?: string;
  ditanganiOleh?: string;
  createdAt: string;
}

export default function PatientAccidentLog() {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccidents() {
      setLoading(true);
      const res = await fetch("/api/patients/log-accident");
      const data = await res.json();
      console.log("Accident data:", data);
      setAccidents(data);
      setLoading(false);
    }
    fetchAccidents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Log Accident Saya</h1>
      <div className="bg-black/40 rounded-lg shadow-lg border border-purple-500/20 p-6">
        <h2 className="font-semibold text-lg mb-4 text-white">
          Riwayat Accident
        </h2>
        {loading ? (
          <div className="text-center text-purple-300/70 p-6">Loading...</div>
        ) : (
          <table className="w-full text-sm border border-purple-500/20 rounded-lg">
            <thead className="bg-black/40">
              <tr>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Tanggal Kejadian
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Lokasi
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Kronologi
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Status
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Penanganan
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Kondisi
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Catatan
                </th>
              </tr>
            </thead>
            <tbody>
              {accidents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-purple-300/70 p-6"
                  >
                    Tidak ada data accident
                  </td>
                </tr>
              ) : (
                accidents.map((a) => (
                  <tr key={a.id}>
                    <td className="p-3 text-white">
                      {new Date(a.tanggalKejadian).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-white">{a.lokasi}</td>
                    <td className="p-3 text-white">{a.kronologi}</td>
                    <td className="p-3 text-white">
                      {a.sudahDitangani ? "Sudah" : "Belum"}
                    </td>
                    <td className="p-3 text-white">{a.penanganan || "-"}</td>
                    <td className="p-3 text-white">
                      {a.kondisiPatient || "-"}
                    </td>
                    <td className="p-3 text-white">
                      {a.catatanTambahan || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
