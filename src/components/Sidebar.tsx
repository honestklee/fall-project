"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  FaHospital,
  FaUserInjured,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaSignOutAlt,
  FaRobot,
} from "react-icons/fa";

export default function Sidebar({ role }: { role: string | null | undefined }) {
  if (!role) return null; // Kalau belum login, tidak render sidebar

  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN" || isSuperAdmin;

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-purple-500/20 flex flex-col">
      <div className="flex-1">
        <div className="p-6 flex items-center gap-3">
          <FaHospital className="text-purple-400 text-2xl" />
          <span className="font-bold text-xl text-purple-400">
            Hospital Data
          </span>
        </div>
        <nav className="flex flex-col px-4 gap-2 text-purple-300">
          {/* Admin dan Super Admin Menu */}
          {isAdmin && (
            <>
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
              >
                <FaClipboardList className="text-purple-400 group-hover:text-purple-300" />
                <span>Management Dashboard</span>
              </Link>

              <Link
                href="/dashboard/admin/accounts"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
              >
                <FaUsers className="text-purple-400 group-hover:text-purple-300" />
                <span>Pasien Account</span>
              </Link>

              {/* Hanya SUPER_ADMIN bisa lihat ini */}
              {isSuperAdmin && (
                <Link
                  href="/dashboard/admin/account-admins"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
                >
                  <FaUsers className="text-purple-400 group-hover:text-purple-300" />
                  <span>Admin Account</span>
                </Link>
              )}

              <Link
                href="/dashboard/admin/accident"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
              >
                <FaUserInjured className="text-purple-400 group-hover:text-purple-300" />
                <span>Fall Data</span>
              </Link>

              <Link
                href="/dashboard/admin/log-accident"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
              >
                <FaFileAlt className="text-purple-400 group-hover:text-purple-300" />
                <span>Log Accident</span>
              </Link>
            </>
          )}

          {/* Pasien */}
          {role === "PATIENT" && (
            <>
              <Link
                href="/dashboard/patient"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
              >
                <FaUserInjured className="text-purple-400 group-hover:text-purple-300" />
                <span>Pasien Dashboard</span>
              </Link>
              <Link
                href="/dashboard/patient/AI"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
              >
                <FaRobot className="text-purple-400 group-hover:text-purple-300" />
                <span>Pasien AI</span>
              </Link>
              <Link
                href="/dashboard/patient/log-accident"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/10 transition-colors group"
              >
                <FaFileAlt className="text-purple-400 group-hover:text-purple-300" />
                <span>Documentation</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-purple-500/20">
        <button
          onClick={() => signOut()}
          className="w-full p-3 flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02]"
          title="Logout"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </aside>
  );
}
