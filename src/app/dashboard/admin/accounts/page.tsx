"use client";

import { useEffect, useState } from "react";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import fetchWithAuth from "@/lib/fetchWithAuth";

export default function PatientAccounts() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [newAccount, setNewAccount] = useState({
    fullName: "",
    email: "",
    address: "",
    dob: "",
    password: "",
    noHp: "",
  });

  const [editAccount, setEditAccount] = useState({
    id: "",
    fullName: "",
    email: "",
    address: "",
    dob: "",
    password: "",
    noHp: "",
  });

  useEffect(() => {
    const getData = async () => {
      const res = await fetchWithAuth("/api/accounts");
      const json = await res.json();
      setPatients(json);
    };
    getData();
  }, []);

  const filtered = patients.filter(
    (p: any) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetchWithAuth("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });

    if (res.ok) {
      const refreshed = await fetchWithAuth("/api/accounts");
      const json = await refreshed.json();
      setPatients(json);
      setShowAddAccount(false);
      setNewAccount({
        fullName: "",
        email: "",
        address: "",
        dob: "",
        password: "",
        noHp: "",
      });
      alert("Berhasil ditambahkan");
    } else {
      alert("Gagal menambahkan akun pasien.");
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetchWithAuth(`/api/accounts/${editAccount.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: editAccount.fullName,
        email: editAccount.email,
        address: editAccount.address,
        dob: editAccount.dob,
        noHp: editAccount.noHp,
        ...(editAccount.password && { password: editAccount.password }),
      }),
    });

    if (res.ok) {
      const refreshed = await fetchWithAuth("/api/accounts");
      const json = await refreshed.json();
      setPatients(json);
      setShowEditAccount(false);
      setEditAccount({
        id: "",
        fullName: "",
        email: "",
        address: "",
        dob: "",
        password: "",
        noHp: "",
      });
      alert("Berhasil diperbarui");
    } else {
      alert("Gagal memperbarui akun pasien.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedPatient?.id) return;

    const res = await fetchWithAuth(`/api/accounts/${selectedPatient.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const refreshed = await fetchWithAuth("/api/accounts");
      const json = await refreshed.json();
      setPatients(json);
      setShowDeleteConfirm(false);
      setSelectedPatient(null);
      alert("Berhasil dihapus");
    } else {
      alert("Gagal menghapus akun pasien.");
    }
  };

  const openEditModal = (patient: any) => {
    setEditAccount({
      id: patient.id,
      fullName: patient.fullName,
      email: patient.email,
      address: patient.address,
      dob: patient.dob ? new Date(patient.dob).toISOString().split("T")[0] : "",
      password: "",
      noHp: patient.noHp || "",
    });
    setShowEditAccount(true);
  };

  const openDeleteModal = (patient: any) => {
    setSelectedPatient(patient);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Daftar Akun Pasien</h1>
        <div className="flex items-center space-x-2">
          <input
            placeholder="Cari nama/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-purple-500/20 bg-black/40 backdrop-blur-lg px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50 w-64"
          />
          <button
            onClick={() => setShowAddAccount(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-3 rounded-full transition-colors shadow-lg shadow-purple-500/20 hover:scale-105"
            title="Tambah Akun Pasien"
          >
            <FiPlus size={18} />
          </button>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-lg rounded-lg shadow-lg border border-purple-500/20 p-6">
        <table className="w-full text-sm border border-purple-500/20 rounded-lg">
          <thead className="bg-black/40">
            <tr>
              <th className="p-3 text-left text-purple-300">Nama</th>
              <th className="p-3 text-left text-purple-300">Email</th>
              <th className="p-3 text-left text-purple-300">Nomor HP</th>
              <th className="p-3 text-left text-purple-300">Alamat</th>
              <th className="p-3 text-left text-purple-300">Tanggal Lahir</th>
              <th className="p-3 text-left text-purple-300">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr
                key={p.id}
                className="border-t border-purple-500/10 hover:bg-purple-500/5"
              >
                <td className="p-3 text-white">{p.fullName}</td>
                <td className="p-3 text-white">{p.email}</td>
                <td className="p-3 text-white">{p.noHp}</td>
                <td className="p-3 text-white">{p.address}</td>
                <td className="p-3 text-white">
                  {new Date(p.dob).toLocaleDateString("id-ID")}
                </td>
                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Edit Akun"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => openDeleteModal(p)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Hapus Akun"
                  >
                    <FiTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-purple-300/70">
                  Tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Akun */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-black/90 rounded-lg shadow-lg w-full max-w-md p-6 relative border border-purple-500/20">
            <button
              onClick={() => setShowAddAccount(false)}
              className="absolute top-3 right-3 text-purple-300/70 hover:text-red-400 transition-colors"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-white">
              Tambah Akun Pasien
            </h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Lengkap"
                name="fullName"
                required
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={newAccount.fullName}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, fullName: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={newAccount.email}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, email: e.target.value })
                }
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={newAccount.password}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, password: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Alamat"
                name="address"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={newAccount.address}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, address: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Nomor HP"
                name="noHp"
                required
                pattern="^[0-9]{10,15}$"
                title="Nomor HP harus 10-15 digit angka"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={newAccount.noHp}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, noHp: e.target.value })
                }
              />
              <input
                type="date"
                name="dob"
                required
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                value={newAccount.dob}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, dob: e.target.value })
                }
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="px-4 py-2.5 rounded-lg border border-purple-500/20 bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all duration-200"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Akun */}
      {showEditAccount && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-black/90 rounded-lg shadow-lg w-full max-w-md p-6 relative border border-purple-500/20">
            <button
              onClick={() => setShowEditAccount(false)}
              className="absolute top-3 right-3 text-purple-300/70 hover:text-red-400 transition-colors"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-white">
              Edit Akun Pasien
            </h2>
            <form onSubmit={handleEditAccount} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Lengkap"
                name="fullName"
                required
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={editAccount.fullName}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, fullName: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={editAccount.email}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, email: e.target.value })
                }
              />
              <input
                type="password"
                name="password"
                placeholder="Password Baru (kosongkan jika tidak diubah)"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={editAccount.password}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, password: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Alamat"
                name="address"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={editAccount.address}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, address: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Nomor HP"
                name="noHp"
                required
                pattern="^[0-9]{10,15}$"
                title="Nomor HP harus 10-15 digit angka"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={editAccount.noHp}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, noHp: e.target.value })
                }
              />
              <input
                type="date"
                name="dob"
                required
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                value={editAccount.dob}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, dob: e.target.value })
                }
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditAccount(false)}
                  className="px-4 py-2.5 rounded-lg border border-purple-500/20 bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all duration-200"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteConfirm && selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-black/90 rounded-lg shadow-lg w-full max-w-md p-6 relative border border-purple-500/20">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-3 right-3 text-purple-300/70 hover:text-red-400 transition-colors"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-red-400">
              Konfirmasi Hapus
            </h2>
            <p className="mb-6 text-purple-300/70">
              Apakah Anda yakin ingin menghapus akun pasien{" "}
              <strong className="text-white">
                {selectedPatient?.fullName}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-lg border border-purple-500/20 bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
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
