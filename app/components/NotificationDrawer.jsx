// components/NotificationDrawer.jsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";

/**
 * NotificationDrawer
 * props:
 *  - open (bool)
 *  - onClose (fn)
 *
 * Reads notifications from localStorage:
 *  - admin -> key "notifAdmin"
 *  - penjual -> key `notifSeller_${username}`
 *
 * Notification structure (example):
 * {
 *   id: 12345,
 *   booking: "BK123",
 *   seller: "Warung A",         // optional for admin
 *   items: [{ name, qty, price, seller }, ...],
 *   message: "Pesanan baru ...",
 *   createdAt: 1699999999999,
 *   isRead: false
 * }
 */

export default function NotificationDrawer({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  // load role & username
  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setUsername(localStorage.getItem("username"));
  }, []);

  // load notifications according to role
  useEffect(() => {
    if (!role) return;
    if (role === "admin") {
      const n = JSON.parse(localStorage.getItem("notifAdmin") || "[]");
      setNotifications(n.reverse());
    } else if (role === "penjual") {
      const key = `notifSeller_${username}`;
      const n = JSON.parse(localStorage.getItem(key) || "[]");
      setNotifications(n.reverse());
    }
  }, [role, username, open]);

  // helper: format time relative (simple)
  const timeAgo = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - ts;
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s lalu`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}j lalu`;
    const d = Math.floor(h / 24);
    return `${d}d lalu`;
  };

  const persist = (arr) => {
    if (role === "admin") {
      localStorage.setItem("notifAdmin", JSON.stringify(arr));
    } else {
      localStorage.setItem(`notifSeller_${username}`, JSON.stringify(arr));
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    persist([...updated].reverse());
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    persist([...updated].reverse());
  };

  const clearAll = () => {
    setNotifications([]);
    persist([]);
  };

  return (
    <>
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 ${open ? "block" : "hidden"}`}
      />

      {/* drawer */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: open ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full md:w-[420px] z-50"
      >
        <div className="h-full flex flex-col bg-white/6 backdrop-blur-xl border-l border-white/20 text-white p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* header image (uploaded file) */}
              <img
                src="/mnt/data/a6f3a510-f92c-48d0-aa7d-467c72797155.png"
                alt="notif header"
                className="w-12 h-12 rounded-lg object-cover border border-white/20"
              />
              <div>
                <h3 className="font-bold text-lg">Notifikasi</h3>
                <p className="text-sm text-white/80">
                  {role === "admin" ? "Untuk Admin" : `Untuk ${username || "Penjual"}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="px-3 py-1 rounded-lg bg-white/10 text-sm hover:bg-white/20"
              >
                Tandai semua dibaca
              </button>

              <button
                onClick={clearAll}
                className="px-2 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                title="Hapus semua notifikasi"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-md bg-white/10 hover:bg-white/20"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* list */}
          <div className="flex-1 overflow-auto pr-2">
            {notifications.length === 0 ? (
              <div className="text-center text-white/80 mt-20">
                Tidak ada notifikasi.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`mb-3 p-3 rounded-xl border ${
                    n.isRead ? "bg-white/5 border-white/10" : "bg-white/12 border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{n.booking}</div>
                        {!n.isRead && <div className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded">Baru</div>}
                      </div>

                      <p className="text-sm text-white/90 mt-2">
                        {n.message ||
                          (n.items
                            ? `${n.items.length} item — ${n.items
                                .map((it) => it.name)
                                .slice(0, 3)
                                .join(", ")}`
                            : "Detail tidak tersedia")}
                      </p>

                      {/* jika ada items tampilkan ringkasan per item */}
                      {n.items && (
                        <div className="mt-2 text-xs text-white/80">
                          {n.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{it.name} x{it.qty}</span>
                              <span>Rp {((it.price || 0) * (it.qty || 1)).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-3">
                      <div className="text-xs text-white/70">{timeAgo(n.createdAt)}</div>
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="mt-2 px-2 py-1 text-xs rounded bg-pink-600 hover:bg-pink-700"
                      >
                        {n.isRead ? "Sudah" : "Tandai"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* footer */}
          <div className="mt-4 text-center text-white/70 text-sm">
            <div>Notifikasi disimpan di localStorage (sementara).</div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
