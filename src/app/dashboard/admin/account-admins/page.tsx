"use client";
import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import fetchWithAuth from "@/lib/fetchWithAuth";

export default function AdminAccountsPage() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    noHp: "",
    position: "",
  });
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<any | null>(null);

  const loadAdmins = async () => {
    const res = await fetchWithAuth("/api/admins");
    const data = await res.json();
    setAdmins(data);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const validate = () => {
    if (!editId) {
      // Mode tambah: semua wajib
      if (!form.fullName.trim()) return "Nama lengkap wajib diisi";
      if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))
        return "Format email tidak valid";
      if (form.password.length < 6) return "Password minimal 6 karakter";
      if (!form.noHp.match(/^[0-9]{10,15}$/))
        return "Nomor HP harus 10-15 digit angka";
      if (!form.position) return "Jabatan wajib dipilih";
      if (form.position === "Lainnya" && form.position.trim() === "")
        return "Jabatan baru wajib diisi";
    } else {
      // Mode edit: hanya field yang diisi, validasi formatnya saja
      if (form.fullName && !form.fullName.trim())
        return "Nama lengkap tidak boleh hanya spasi";
      if (form.email && !form.email.match(/^[^@]+@[^@]+\.[^@]+$/))
        return "Format email tidak valid";
      if (form.password && form.password.length < 6)
        return "Password minimal 6 karakter";
      if (form.noHp && !form.noHp.match(/^[0-9]{10,15}$/))
        return "Nomor HP harus 10-15 digit angka";
      if (
        form.position &&
        form.position === "Lainnya" &&
        form.position.trim() === ""
      )
        return "Jabatan baru wajib diisi";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorMsg = validate();
    if (errorMsg) {
      alert("❌ " + errorMsg);
      return;
    }

    const method = editId ? "PATCH" : "POST";
    const url = editId ? `/api/admins/${editId}` : "/api/admins";

    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert(editId ? "✅ Admin diperbarui" : "✅ Admin ditambahkan");
        setForm({
          fullName: "",
          email: "",
          password: "",
          noHp: "",
          position: "",
        });
        setEditId(null);
        setIsOpen(false);
        loadAdmins();
      } else {
        let errorData: any = {};
        try {
          const text = await res.text();
          errorData = text ? JSON.parse(text) : {};
        } catch (e) {
          errorData = {};
        }
        alert("❌ " + (errorData.error || "Gagal menyimpan"));
      }
    } catch (error: any) {
      if (error?.message === "Session expired") {
        setIsOpen(false); // Tutup modal edit
        return;
      }
      alert("❌ Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleEdit = (admin: any) => {
    setEditId(admin.id);
    setForm({
      fullName: admin.fullName || "",
      email: admin.email,
      password: "",
      noHp: admin.noHp || "",
      position: admin.position || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/admins/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✅ Admin dihapus");
        loadAdmins();
      } else {
        alert("❌ Gagal hapus");
      }
    } catch (error: any) {
      if (error?.message === "Session expired") {
        setIsOpen(false);
        return;
      }
      alert("❌ Terjadi kesalahan saat menghapus admin");
    }
  };

  const filtered = admins.filter((a: any) =>
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Akun Admin</h1>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Cari admin..."
            className="border border-purple-500/20 bg-black/40 backdrop-blur-lg px-4 py-2.5 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => {
              setEditId(null);
              setForm({
                fullName: "",
                email: "",
                password: "",
                noHp: "",
                position: "",
              });
              setIsOpen(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-3 rounded-full transition-colors shadow-lg shadow-purple-500/20 hover:scale-105"
            title="Tambah Admin"
          >
            <FiPlus />
          </button>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-lg rounded-lg shadow-lg border border-purple-500/20 p-6">
        <h2 className="text-lg font-semibold mb-3 text-white">Daftar Admin</h2>
        <table className="w-full text-sm border border-purple-500/20 rounded-lg">
          <thead className="bg-black/40">
            <tr>
              <th className="text-left p-3 text-purple-300">Nama Lengkap</th>
              <th className="text-left p-3 text-purple-300">Email</th>
              <th className="text-left p-3 text-purple-300">Nomor HP</th>
              <th className="text-left p-3 text-purple-300">Jabatan</th>
              <th className="text-left p-3 text-purple-300">Last Login</th>
              <th className="text-center p-3 text-purple-300">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a: any) => (
              <tr
                key={a.id}
                className="border-t border-purple-500/10 hover:bg-purple-500/5"
              >
                <td className="p-3 text-white">{a.fullName || "-"}</td>
                <td className="p-3 text-white">{a.email}</td>
                <td className="p-3 text-white">{a.noHp || "-"}</td>
                <td className="p-3 text-white">{a.position || "-"}</td>
                <td className="p-3 text-white">
                  {a.lastLogin
                    ? new Date(a.lastLogin).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })
                    : "-"}
                </td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(a)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteAdmin(a);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
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

      {/* Modal Tambah/Edit */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-black/90 max-w-sm w-full p-6 rounded-lg shadow-lg relative border border-purple-500/20">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-purple-300/70 hover:text-red-400 transition-colors"
            >
              <FiX />
            </button>
            <Dialog.Title className="text-lg font-bold mb-4 text-white">
              {editId ? "Edit Admin" : "Tambah Admin"}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="fullName"
                placeholder="Nama Lengkap"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required={!editId}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required={!editId}
                readOnly={!!editId}
              />
              <input
                type="password"
                name="password"
                placeholder={editId ? "Password baru (opsional)" : "Password"}
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editId}
              />
              <input
                type="text"
                name="noHp"
                placeholder="Nomor HP"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={form.noHp}
                onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                required={!editId}
              />
              <select
                name="position"
                className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                required={!editId}
              >
                <option value="">Pilih Jabatan</option>
                <option value="Dokter">Dokter</option>
                <option value="Perawat">Perawat</option>
                <option value="Administrasi">Administrasi</option>
                <option value="Kepala Ruangan">Kepala Ruangan</option>
                <option value="Kepala Rumah Sakit">Kepala Rumah Sakit</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {form.position === "Lainnya" && (
                <input
                  type="text"
                  placeholder="Jabatan Baru"
                  className="w-full border border-purple-500/20 bg-black/40 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                />
              )}
              <button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2.5 rounded-lg w-full shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all duration-200">
                {editId ? "Simpan Perubahan" : "Tambah Admin"}
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-black/90 rounded-lg shadow-lg w-full max-w-md p-6 relative border border-purple-500/20">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteAdmin(null);
              }}
              className="absolute top-3 right-3 text-purple-300/70 hover:text-red-400 transition-colors"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-red-400">
              Konfirmasi Hapus
            </h2>
            <p className="mb-6 text-purple-300/70">
              Yakin ingin menghapus admin{" "}
              <span className="font-bold text-red-400">
                {deleteAdmin?.fullName}
              </span>{" "}
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteAdmin(null);
                }}
                className="px-4 py-2.5 rounded-lg border border-purple-500/20 bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  if (deleteAdmin) {
                    await handleDelete(deleteAdmin.id);
                  }
                  setShowDeleteConfirm(false);
                  setDeleteAdmin(null);
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
