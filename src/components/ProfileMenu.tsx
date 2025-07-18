"use client";
import React, { useState, ChangeEvent } from "react";
import { signOut } from "next-auth/react";
import fetchWithAuth from "@/lib/fetchWithAuth";

interface ProfileMenuProps {
  user?: {
    name?: string;
    email?: string;
    noHp?: string;
    profilePhotoUrl?: string;
    role?: string;
    fullName?: string;
    position?: string;
  };
}

const getInitials = (nameOrEmail?: string) => {
  if (!nameOrEmail) return "?";
  return nameOrEmail[0].toUpperCase();
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editPhotoMode, setEditPhotoMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Klik icon profile untuk buka/tutup dropdown
  const handleAvatarClick = () => {
    setDropdownOpen((open) => !open);
    setEditPhotoMode(false);
  };

  // Klik icon di dalam dropdown untuk ganti foto
  const handleDropdownAvatarClick = () => {
    setEditPhotoMode(true);
  };

  const handleClose = () => {
    setDropdownOpen(false);
    setEditPhotoMode(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleCancelEditPhoto = () => {
    setEditPhotoMode(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (jpg/png)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetchWithAuth("/api/patients/profile/photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditPhotoMode(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        // Reload halaman agar foto baru langsung tampil
        window.location.reload();
      } else {
        setError(data.error || "Gagal upload foto.");
      }
    } catch (err) {
      setError("Gagal upload foto.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    // Validasi input (sudah ada)
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError("Semua field wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Konfirmasi password tidak sama.");
      return;
    }
    setPwLoading(true);
    // Tentukan endpoint sesuai role
    let endpoint = "/api/patients/profile";
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
      endpoint = "/api/admins/profile";
    }
    const res = await fetchWithAuth(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });
    const data = await res.json();
    setPwLoading(false);
    if (res.ok && data.success) {
      setPwSuccess(
        "Password berhasil diubah! Anda akan keluar dan login ulang."
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        // Logout otomatis setelah password diubah
        import("next-auth/react").then(({ signOut }) => signOut());
      }, 3500);
    } else {
      setPwError(data.error || "Gagal mengubah password.");
    }
  };

  return (
    <div className="relative">
      <div
        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-purple-400 flex items-center justify-center text-white text-xl font-bold cursor-pointer border-2 border-purple-300 hover:opacity-90 transition relative"
        onClick={handleAvatarClick}
        title="Profile"
      >
        {user?.profilePhotoUrl ? (
          <img
            src={user.profilePhotoUrl}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          getInitials(user?.name || user?.email)
        )}
      </div>
      {dropdownOpen && !editPhotoMode && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg z-50 p-4 border border-purple-200">
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-700 to-purple-400 flex items-center justify-center text-white text-2xl font-bold cursor-pointer border-2 border-purple-300"
              onClick={handleDropdownAvatarClick}
              title="Edit Foto Profil"
            >
              {user?.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                getInitials(user?.name || user?.email)
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              {/* ADMIN/SUPER_ADMIN: tampilkan fullName & position */}
              {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
                <>
                  {user?.fullName && (
                    <div
                      className="font-bold text-gray-900 text-lg break-all leading-tight"
                      style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                      title={user.fullName}
                    >
                      {user.fullName}
                    </div>
                  )}
                  {user?.position && (
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                      {user.position}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="font-bold text-gray-900 text-lg break-all leading-tight"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                  title={user?.name}
                >
                  {user?.name || "-"}
                </div>
              )}
              <div className="text-xs text-purple-700 font-semibold uppercase tracking-wider">
                {user?.role || "-"}
              </div>
            </div>
          </div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-gray-500 text-sm">📧</span>
            <span className="text-gray-700 text-sm truncate">
              {user?.email || "-"}
            </span>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-gray-500 text-sm">📱</span>
            <span className="text-gray-700 text-sm truncate">
              {user?.noHp || "-"}
            </span>
          </div>
          <button
            className="w-full py-2 mt-2 rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition text-sm"
            onClick={() => setShowPasswordModal(true)}
          >
            🔒 Ubah Password
          </button>
          <button
            className="w-full py-2 mt-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition text-sm"
            onClick={() => signOut()}
          >
            🚪 Logout
          </button>
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-lg"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
      )}
      {dropdownOpen && editPhotoMode && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg z-50 p-4 border border-purple-200 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-700 to-purple-400 flex items-center justify-center text-white text-3xl font-bold mb-3 overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-full"
              />
            ) : user?.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              getInitials(user?.name || user?.email)
            )}
          </div>
          <div className="flex flex-col items-center w-full">
            <label
              htmlFor="profile-photo-upload"
              className="cursor-pointer px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition mb-2"
            >
              Pilih Foto
            </label>
            <input
              id="profile-photo-upload"
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <span className="text-sm text-gray-600 mt-1">
                {selectedFile.name}
              </span>
            )}
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button
            className="w-full py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition text-sm mb-2"
            onClick={handleSavePhoto}
            disabled={!selectedFile}
          >
            Simpan
          </button>
          <button
            className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition text-sm mb-2"
            onClick={handleCancelEditPhoto}
          >
            Batal
          </button>
        </div>
      )}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-lg"
              onClick={() => {
                setShowPasswordModal(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPwError("");
                setPwSuccess("");
              }}
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 text-purple-700">
              Ubah Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                placeholder="Password Lama"
                className="w-full border p-2 rounded"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password Baru"
                className="w-full border p-2 rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                className="w-full border p-2 rounded"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {pwError && <div className="text-red-500 text-sm">{pwError}</div>}
              {pwSuccess && (
                <div className="text-green-600 text-sm">{pwSuccess}</div>
              )}
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded font-semibold"
                disabled={pwLoading}
              >
                {pwLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
