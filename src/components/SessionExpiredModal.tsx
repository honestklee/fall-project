import { useEffect, useState } from "react";

export default function SessionExpiredModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, []);

  // Auto-redirect
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 6000); // detik
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    window.location.href = "/login";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <h2 className="text-xl font-bold mb-2">Session Expired</h2>
        <p className="mb-4">Silakan login ulang.</p>
        <button
          onClick={handleClose}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          OK
        </button>
        <div className="text-xs text-gray-400 mt-2">
          Akan redirect otomatis ke login...
        </div>
      </div>
    </div>
  );
}
