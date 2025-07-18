"use client";

import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useSession } from "next-auth/react";
import SessionExpiredModal from "@/components/SessionExpiredModal";
import fetchWithAuth from "@/lib/fetchWithAuth";

// Interface Accident
interface Accident {
  id: string;
  tanggalKejadian: string;
  lokasi: string;
  kronologi: string;
  sudahDitangani: boolean;
  ditanganiOleh?: string;
  penanganan?: string;
  kondisiPatient?: string;
  hasilPengecekan?: string;
  catatanTambahan?: string;
  createdAt: string;
  patientName?: string;
}

export default function LogAccidentPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // State untuk form
  const [tanggalKejadian, setTanggalKejadian] = useState("");
  const [waktuKejadian, setWaktuKejadian] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [kronologi, setKronologi] = useState("");
  const [sudahDitangani, setSudahDitangani] = useState(false);
  const [ditanganiOleh, setDitanganiOleh] = useState("");
  const [penanganan, setPenanganan] = useState("");
  const [kondisiPatient, setKondisiPatient] = useState("");
  const [kondisiPatientLainnya, setKondisiPatientLainnya] = useState("");
  const [hasilPengecekan, setHasilPengecekan] = useState("");
  const [catatanTambahan, setCatatanTambahan] = useState("");

  // State untuk accident data
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // State untuk daftar pasien dan selectedPatientId
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const { data: session } = useSession();

  // Fetch daftar pasien dari /api/patients saat modal dibuka
  useEffect(() => {
    if (showModal) {
      fetch("/api/patients")
        .then((res) => res.json())
        .then((data) =>
          setPatients(data.map((p: any) => ({ id: p.id, name: p.fullName })))
        );
    }
  }, [showModal]);

  useEffect(() => {
    async function fetchAccidents() {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/api/log-accident");
        if (!res.ok) throw new Error("Gagal fetch data accident");
        const data = await res.json();
        setAccidents(data);
      } catch (error) {
        // Tambahkan log ini untuk debug
        console.error("Error fetchAccidents:", error);
        // Jangan return, biarkan event session-expired tetap berjalan
        setAccidents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAccidents();
    (window as any).fetchAccidents = fetchAccidents;
  }, []);

  // Handler submit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");
    if (!selectedPatientId) {
      setSubmitError("Pasien harus dipilih!");
      setSubmitLoading(false);
      return;
    }
    const tanggalKejadianFull =
      tanggalKejadian + (waktuKejadian ? `T${waktuKejadian}` : "");
    const body = {
      tanggalKejadian: tanggalKejadianFull,
      lokasi,
      kronologi,
      sudahDitangani,
      ditanganiOleh: sudahDitangani ? ditanganiOleh : undefined,
      penanganan: sudahDitangani ? penanganan : undefined,
      kondisiPatient:
        kondisiPatient === "lainnya" ? kondisiPatientLainnya : kondisiPatient,
      hasilPengecekan: sudahDitangani ? hasilPengecekan : undefined,
      catatanTambahan,
      patientId: selectedPatientId,
      petugasPencatatId: session?.user?.id,
    };
    try {
      const res = await fetchWithAuth("/api/log-accident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Gagal menyimpan data accident");
      // Reset form
      setTanggalKejadian("");
      setWaktuKejadian("");
      setLokasi("");
      setKronologi("");
      setSudahDitangani(false);
      setDitanganiOleh("");
      setPenanganan("");
      setKondisiPatient("");
      setKondisiPatientLainnya("");
      setHasilPengecekan("");
      setCatatanTambahan("");
      setSelectedPatientId("");
      setShowModal(false);
      // Refresh data
      setLoading(true);
      const res2 = await fetchWithAuth("/api/log-accident");
      const data = await res2.json();
      setAccidents(data);
      setLoading(false);
    } catch (err: any) {
      setSubmitError(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitLoading(false);
    }
  }

  // Tambahkan fungsi handleDelete
  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus data accident ini?")) return;
    try {
      const res = await fetchWithAuth(`/api/log-accident/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus accident");
      // Refresh data
      setAccidents((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus accident");
    }
  }

  return (
    <>
      <SessionExpiredModal />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Log Accident</h1>
            <p className="text-sm text-purple-300/70 mt-1">
              Riwayat dan pencatatan kejadian kecelakaan pasien
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Cari data..."
              className="border border-purple-500/20 bg-black/40 backdrop-blur-lg px-4 py-2.5 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-3 rounded-full transition-colors shadow-lg shadow-purple-500/20 hover:scale-105"
              title="Tambah Accident"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-lg rounded-lg shadow-lg border border-purple-500/20 p-6">
          <h2 className="font-semibold text-lg mb-4 text-white">
            Daftar Accident
          </h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center text-purple-300/70 p-6">
                Loading...
              </div>
            ) : (
              <table className="w-full text-sm border border-purple-500/20 rounded-lg">
                <thead className="bg-black/40">
                  <tr>
                    <th className="p-3 text-left text-purple-300 font-medium">
                      Nama Pasien
                    </th>
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
                      Sudah Ditangani
                    </th>
                    <th className="p-3 text-left text-purple-300 font-medium">
                      Ditangani Oleh
                    </th>
                    <th className="p-3 text-left text-purple-300 font-medium">
                      Penanganan
                    </th>
                    <th className="p-3 text-left text-purple-300 font-medium">
                      Kondisi Pasien
                    </th>
                    <th className="p-3 text-left text-purple-300 font-medium">
                      Hasil Pengecekan
                    </th>
                    <th className="p-3 text-left text-purple-300 font-medium">
                      Catatan Tambahan
                    </th>
                    <th className="p-3 text-left text-purple-300 font-medium">
                      Created At
                    </th>
                    <th className="p-3 text-left text-purple-300 font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accidents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="text-center text-purple-300/70 p-6"
                      >
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    accidents
                      .filter((a) =>
                        search === ""
                          ? true
                          : a.lokasi
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                            a.kronologi
                              .toLowerCase()
                              .includes(search.toLowerCase())
                      )
                      .map((accident) => (
                        <tr key={accident.id}>
                          <td className="p-3 text-white">
                            {accident.patientName}
                          </td>
                          <td className="p-3 text-white">
                            {new Date(accident.tanggalKejadian).toLocaleString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                          <td className="p-3 text-white">{accident.lokasi}</td>
                          <td className="p-3 text-white">
                            {accident.kronologi}
                          </td>
                          <td className="p-3 text-white">
                            {accident.sudahDitangani ? "Sudah" : "Belum"}
                          </td>
                          <td className="p-3 text-white">
                            {accident.ditanganiOleh || "-"}
                          </td>
                          <td className="p-3 text-white">
                            {accident.penanganan || "-"}
                          </td>
                          <td className="p-3 text-white">
                            {accident.kondisiPatient || "-"}
                          </td>
                          <td className="p-3 text-white">
                            {accident.hasilPengecekan || "-"}
                          </td>
                          <td className="p-3 text-white">
                            {accident.catatanTambahan || "-"}
                          </td>
                          <td className="p-3 text-white">
                            {new Date(accident.createdAt).toLocaleString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                          <td className="p-3 text-white">
                            <button
                              onClick={() => handleDelete(accident.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Hapus accident"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Tambah Accident */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="relative bg-black/90 border border-purple-500/30 rounded-lg shadow-lg p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-3 right-3 text-purple-300 hover:text-white text-2xl"
                onClick={() => setShowModal(false)}
                title="Tutup"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-white">
                Tambah Accident
              </h2>
              <form className="space-y-4 pb-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block font-medium mb-1 text-purple-200">
                    Pilih Pasien
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Pasien</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1 text-purple-200">
                    Tanggal Kejadian
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                    value={tanggalKejadian}
                    onChange={(e) => setTanggalKejadian(e.target.value)}
                  />
                  <input
                    type="time"
                    className="w-full mt-2 px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                    value={waktuKejadian}
                    onChange={(e) => setWaktuKejadian(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-purple-200">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-purple-200">
                    Kronologi
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                    value={kronologi}
                    onChange={(e) => setKronologi(e.target.value)}
                  />
                </div>

                <label className="inline-flex items-center text-purple-200">
                  <input
                    type="checkbox"
                    className="mr-2 accent-purple-600"
                    checked={sudahDitangani}
                    onChange={(e) => setSudahDitangani(e.target.checked)}
                  />
                  Sudah Ditangani
                </label>

                {sudahDitangani && (
                  <>
                    <div>
                      <label className="block font-medium mb-1 text-purple-200">
                        Ditangani Oleh
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                        value={ditanganiOleh}
                        onChange={(e) => setDitanganiOleh(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-purple-200">
                        Penanganan
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                        value={penanganan}
                        onChange={(e) => setPenanganan(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-purple-200">
                        Kondisi Pasien
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                        value={kondisiPatient}
                        onChange={(e) => setKondisiPatient(e.target.value)}
                      >
                        <option value="">Pilih Kondisi</option>
                        <option value="stabil">Stabil</option>
                        <option value="observasi">Perlu Observasi</option>
                        <option value="kritis">Kritis</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>

                    {kondisiPatient === "lainnya" && (
                      <div>
                        <label className="block font-medium mb-1 text-purple-200">
                          Tulis Kondisi Lainnya
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                          value={kondisiPatientLainnya}
                          onChange={(e) =>
                            setKondisiPatientLainnya(e.target.value)
                          }
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-medium mb-1 text-purple-200">
                        Hasil Pengecekan
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                        value={hasilPengecekan}
                        onChange={(e) => setHasilPengecekan(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-medium mb-1 text-purple-200">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-2.5 bg-black/40 border border-purple-500/20 rounded-lg text-white"
                    value={catatanTambahan}
                    onChange={(e) => setCatatanTambahan(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded hover:scale-105"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
                {submitError && (
                  <div className="text-red-400 text-sm mt-2">{submitError}</div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
