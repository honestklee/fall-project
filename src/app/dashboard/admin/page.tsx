"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiX, FiEdit, FiTrash, FiChevronDown } from "react-icons/fi";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useSession } from "next-auth/react";
import ProfileMenu from "@/components/ProfileMenu";

interface Patient {
  id: string;
  fullName: string;
  dob: string | null;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientDob: string | null;
  penyakit: string;
  obat: string;
  dokter: string;
  ruangan: string;
  tanggal: string;
}

export default function AdminDashboard() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );

  // State searchable dropdown
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    penyakit: "",
    obat: "",
    dokter: "",
    ruangan: "",
    tanggal: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState<MedicalRecord | null>(null);

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    console.log("formatDate input:", dateString, typeof dateString); // Debug log

    if (!dateString) return "Tanggal tidak tersedia";

    const date = new Date(dateString);
    console.log("Parsed date:", date, "isValid:", !isNaN(date.getTime())); // Debug log

    if (isNaN(date.getTime())) return "Tanggal tidak tersedia";

    // Check tanggal defaultnya  (1900-01-01)
    if (
      date.getFullYear() === 1900 &&
      date.getMonth() === 0 &&
      date.getDate() === 1
    ) {
      return "Tanggal tidak tersedia";
    }

    return date.toLocaleDateString("id-ID");
  };

  const load = async () => {
    try {
      const [r, p] = await Promise.all([
        fetchWithAuth("/api/medical-records").then((res) => res.json()),
        fetchWithAuth("/api/patients").then((res) => res.json()),
      ]);
      console.log("Loaded patients:", p); // Debug log untuk melihat struktur data
      setRecords(r);
      setPatients(p);
      setFilteredPatients(p);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("❌ Terjadi kesalahan saat memuat data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter patients berdasarkan pencarian
  useEffect(() => {
    const filtered = patients.filter((patient) =>
      patient.fullName.toLowerCase().includes(patientSearch.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [patientSearch, patients]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !form.patientId ||
      !form.patientName ||
      !form.penyakit ||
      !form.obat ||
      !form.dokter ||
      !form.ruangan
    ) {
      alert("❌ Semua field harus diisi dan pasien harus dipilih dari daftar!");
      return;
    }

    const selectedPatient = patients.find((p) => p.id === form.patientId);
    if (!selectedPatient) {
      alert(
        "❌ Pasien tidak valid. Silakan pilih pasien dari daftar yang tersedia."
      );
      return;
    }

    // Validate that the patient name matches
    if (selectedPatient.fullName !== form.patientName) {
      alert("❌ Data pasien tidak konsisten. Silakan pilih ulang dari daftar.");
      return;
    }

    const method = editMode ? "PATCH" : "POST";
    const url = editMode
      ? `/api/medical-records/${selectedRecord?.id}`
      : `/api/medical-records`;

    // Prepare submission data
    const submitData = {
      ...form,

      tanggal: editMode && form.tanggal ? form.tanggal : undefined,
    };

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Data berhasil disimpan");
        resetForm();
        load();
      } else {
        alert("❌ " + data.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("❌ Terjadi kesalahan saat menyimpan data");
    }
  };

  const resetForm = () => {
    setForm({
      patientId: "",
      patientName: "",
      penyakit: "",
      obat: "",
      dokter: "",
      ruangan: "",
      tanggal: "",
    });
    setPatientSearch("");
    setShowPatientDropdown(false);
    setIsOpen(false);
    setEditMode(false);
    setSelectedRecord(null);
  };

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setEditMode(true);
    setIsOpen(true);
    setForm({
      patientId: record.patientId,
      patientName: record.patientName ?? "",
      penyakit: record.penyakit,
      obat: record.obat,
      dokter: record.dokter,
      ruangan: record.ruangan,
      tanggal: record.tanggal.slice(0, 16), // Include time for datetime-local
    });
    setPatientSearch(record.patientName ?? "");
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/medical-records/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Data berhasil dihapus");
        load();
      } else {
        let data = {};
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = {};
        }
        alert("❌ " + ((data as any).error || "Gagal menghapus data"));
      }
    } catch (error: any) {
      if (error?.message === "Session expired") {
        setIsOpen(false);
        return;
      }
      alert("❌ Terjadi kesalahan saat menghapus data");
    }
  };

  // Handle patient selection dari dropdown
  const handlePatientSelect = (patient: Patient) => {
    setForm({
      ...form,
      patientId: patient.id,
      patientName: patient.fullName,
    });
    setPatientSearch(patient.fullName);
    setShowPatientDropdown(false);
  };

  // Handle manual typing in patient search - clear patientId if text doesn't match any patient
  const handlePatientSearchChange = (value: string) => {
    setPatientSearch(value);
    setShowPatientDropdown(true);

    // Check if the typed value exactly matches an existing patient
    const exactMatch = patients.find(
      (p) => p.fullName.toLowerCase() === value.toLowerCase()
    );

    if (exactMatch) {
      setForm({
        ...form,
        patientId: exactMatch.id,
        patientName: exactMatch.fullName,
      });
    } else {
      // Clear patientId if no exact match
      setForm({
        ...form,
        patientId: "",
        patientName: value,
      });
    }
  };

  const filtered = records.filter((r) =>
    r.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-purple-300/70 mt-1">
            Welcome back, admin@hospital.com
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Cari nama pasien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-purple-500/20 bg-black/40 backdrop-blur-lg px-4 py-2.5 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
          />
          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
              setIsOpen(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-3 rounded-full transition-colors shadow-lg shadow-purple-500/20 hover:scale-105 w-12 h-12 flex items-center justify-center"
            title="Tambah Rekam Medis"
          >
            <FiPlus />
          </button>
          {/* ProfileMenu di sebelah kanan tombol + */}
          <div className="w-12 h-12 flex items-center justify-center">
            <ProfileMenu
              user={{
                name: session?.user?.name ?? undefined,
                email: session?.user?.email ?? undefined,
                noHp: session?.user?.noHp ?? undefined,
                profilePhotoUrl: session?.user?.profilePhotoUrl ?? undefined,
                role: session?.user?.role ?? undefined,
                fullName: (session?.user as any)?.fullName ?? undefined,
                position: (session?.user as any)?.position ?? undefined,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-lg rounded-lg shadow-lg border border-purple-500/20 p-6">
        <h2 className="font-semibold text-lg mb-4 text-white">
          Patient Management
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-purple-500/20 rounded-lg">
            <thead className="bg-black/40">
              <tr>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Nama Pasien
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Tanggal Lahir
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Penyakit
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Obat
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Dokter
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Ruangan
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Waktu Diagnosis
                </th>
                <th className="p-3 text-left text-purple-300 font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                >
                  <td className="p-3 text-white">{r.patientName}</td>
                  <td className="p-3 text-white">{formatDate(r.patientDob)}</td>
                  <td className="p-3 text-white">{r.penyakit}</td>
                  <td className="p-3 text-white">{r.obat}</td>
                  <td className="p-3 text-white">{r.dokter}</td>
                  <td className="p-3 text-white">{r.ruangan}</td>
                  <td className="p-3">
                    <div className="text-xs">
                      <div className="text-white">
                        {new Date(r.tanggal).toLocaleDateString("id-ID")}
                      </div>
                      <div className="text-purple-300/70">
                        {new Date(r.tanggal).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3 text-lg">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteRecord(r);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Hapus"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center text-purple-300/70 p-6"
                  >
                    {search ? "Data tidak ditemukan" : "Belum ada data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={resetForm}
          />
          <div className="bg-black/90 max-w-md w-full p-6 rounded-lg shadow-lg relative z-10 mx-4 max-h-[90vh] overflow-y-auto border border-purple-500/20">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-purple-300/70 hover:text-red-400 transition-colors"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 text-white">
              {editMode ? "Edit Rekam Medis" : "Tambah Rekam Medis"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {editMode ? (
                <div>
                  <label className="block text-sm font-medium text-purple-300/70 mb-1.5">
                    Nama Pasien
                  </label>
                  <input
                    name="patientName"
                    value={form.patientName}
                    onChange={(e) =>
                      setForm({ ...form, patientName: e.target.value })
                    }
                    placeholder="Nama Pasien"
                    className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                    required
                    readOnly
                  />
                </div>
              ) : (
                <div className="relative">
                  <label className="block text-sm font-medium text-purple-300/70 mb-1.5">
                    Nama Pasien *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Pilih pasien dari daftar..."
                      value={patientSearch}
                      onChange={(e) =>
                        handlePatientSearchChange(e.target.value)
                      }
                      onFocus={() => setShowPatientDropdown(true)}
                      className={`w-full border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-black/40 text-white placeholder-purple-300/50 ${
                        !form.patientId && patientSearch
                          ? "border-red-500/50 bg-red-500/10"
                          : "border-purple-500/20"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPatientDropdown(!showPatientDropdown)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300/70 hover:text-purple-300"
                    >
                      <FiChevronDown
                        className={`transition-transform ${
                          showPatientDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Validation indicator */}
                  {!form.patientId && patientSearch && (
                    <div className="text-xs text-red-400 mt-1.5">
                      ⚠️ Pasien harus dipilih dari daftar yang tersedia
                    </div>
                  )}

                  {form.patientId && (
                    <div className="text-xs text-green-400 mt-1.5">
                      ✅ Pasien terpilih
                    </div>
                  )}

                  {showPatientDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-black/90 border border-purple-500/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full text-left px-4 py-2.5 hover:bg-purple-500/10 focus:bg-purple-500/10 border-b border-purple-500/10 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-white">
                              {patient.fullName}
                            </div>
                            <div className="text-xs text-purple-300/70">
                              Lahir: {formatDate(patient.dob)}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2.5 text-purple-300/70 text-sm">
                          {patientSearch
                            ? "Tidak ditemukan"
                            : "Ketik untuk mencari..."}
                        </div>
                      )}

                      {patientSearch &&
                        !filteredPatients.some(
                          (p) =>
                            p.fullName.toLowerCase() ===
                            patientSearch.toLowerCase()
                        ) && (
                          <div className="px-4 py-2.5 text-red-400 text-sm">
                            ❌ Pasien tidak ditemukan. Harap pilih dari daftar
                            yang tersedia.
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Input fields lainnya */}
              <div>
                <label className="block text-sm font-medium text-purple-300/70 mb-1.5">
                  Penyakit *
                </label>
                <input
                  name="penyakit"
                  placeholder="Masukkan nama penyakit"
                  value={form.penyakit}
                  onChange={(e) =>
                    setForm({ ...form, penyakit: e.target.value })
                  }
                  className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300/70 mb-1.5">
                  Obat *
                </label>
                <input
                  name="obat"
                  placeholder="Masukkan nama obat"
                  value={form.obat}
                  onChange={(e) => setForm({ ...form, obat: e.target.value })}
                  className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300/70 mb-1.5">
                  Dokter *
                </label>
                <input
                  name="dokter"
                  placeholder="Masukkan nama dokter"
                  value={form.dokter}
                  onChange={(e) => setForm({ ...form, dokter: e.target.value })}
                  className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300/70 mb-1.5">
                  Ruangan *
                </label>
                <input
                  name="ruangan"
                  placeholder="Masukkan ruangan"
                  value={form.ruangan}
                  onChange={(e) =>
                    setForm({ ...form, ruangan: e.target.value })
                  }
                  className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                  required
                />
              </div>

              {/* Tanggal Diagnosis ,Hanya tampil untuk edit mode */}
              {editMode && (
                <div>
                  <label className="block text-sm font-medium text-purple-300/70 mb-1.5">
                    Waktu Diagnosis
                  </label>
                  <input
                    name="tanggal"
                    type="datetime-local"
                    value={form.tanggal}
                    onChange={(e) =>
                      setForm({ ...form, tanggal: e.target.value })
                    }
                    className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    required
                  />
                </div>
              )}

              {/* Info untuk mode tambah */}
              {!editMode && (
                <div className="bg-purple-500/10 p-4 rounded-lg text-sm text-purple-300/70">
                  ℹ️ Waktu diagnosis akan diset otomatis pada saat penyimpanan
                </div>
              )}

              {/* Warning jika pasien belum dipilih */}
              {!editMode && !form.patientId && (
                <div className="bg-red-500/10 p-4 rounded-lg text-sm text-red-400">
                  ⚠️ Pasien harus dipilih dari daftar yang tersedia sebelum
                  menyimpan
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-black/40 hover:bg-black/60 text-white py-2.5 rounded-lg transition-colors font-medium border border-purple-500/20"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!editMode && !form.patientId}
                  className={`flex-1 py-2.5 rounded-lg transition-colors font-medium ${
                    !editMode && !form.patientId
                      ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02]"
                  }`}
                >
                  {editMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-black/90 rounded-lg shadow-lg w-full max-w-md p-6 relative border border-purple-500/20">
            <h2 className="text-xl font-semibold mb-4 text-red-400">
              Konfirmasi Hapus
            </h2>
            <p className="mb-6 text-purple-300/70">
              Apakah Anda yakin ingin menghapus data medis pasien{" "}
              <strong className="text-white">
                {deleteRecord?.patientName}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteRecord(null);
                }}
                className="px-4 py-2.5 rounded-lg border border-purple-500/20 bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  if (deleteRecord) {
                    await handleDelete(deleteRecord.id);
                  }
                  setShowDeleteConfirm(false);
                  setDeleteRecord(null);
                }}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all duration-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
