"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, ShoppingCart, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function DashboardAdmin() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [username, setUsername] = useState("");

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notif/admin");
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setNotifications(Array.isArray(json) ? json : []);
      } catch {
        console.error("API /api/notif/admin returned non-JSON response:", text);
        setNotifications([]);
      }
    } catch (err) {
      console.error("Gagal fetch notifikasi:", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const user = localStorage.getItem("username");

    if (role !== "admin") {
      router.push("/home");
      return;
    }

    setUsername(user || "Admin");
    loadNotifications();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // ========================================
  // VERIFIKASI PEMBAYARAN
  // ========================================
  const handleVerify = async (orderId, orderCode) => {
    const confirm = await Swal.fire({
      title: "Konfirmasi Pembayaran",
      text: "Tandai pesanan ini sebagai Sudah Dibayar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, verifikasi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10B981",
    });

    if (!confirm.isConfirmed) return;

    try {
      console.log("=== ADMIN VERIFIKASI ===");
      console.log("Order ID:", orderId);
      console.log("Booking Code:", orderCode);

      // Update status di database
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Sudah Dibayar" }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("Gagal verifikasi:", res.status, t);
        Swal.fire("Gagal", "Tidak dapat memverifikasi pembayaran.", "error");
        return;
      }

      const data = await res.json();
      console.log("Response dari server:", data);

      // Update UI lokal
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === orderId ? { ...n, status: "Sudah Dibayar", isRead: true } : n
        )
      );

      Swal.fire({
        title: "Berhasil!",
        html: `
          <p>Status pesanan berhasil diupdate.</p>
          <p class="text-sm text-gray-600 mt-2">Kode: ${orderCode}</p>
          <p class="text-sm text-green-600 font-semibold">Status: Sudah Dibayar ✓</p>
        `,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      console.log("✅ Verifikasi selesai. Database sudah diupdate.");
      console.log("Pembeli akan melihat update saat refresh/polling.");
      
    } catch (err) {
      console.error("Error verify:", err);
      Swal.fire("Error", "Terjadi kesalahan saat memverifikasi.", "error");
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-orange-400 to-red-500 p-2 rounded-xl">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Notifikasi Admin</h1>
                <p className="text-xs text-gray-500">Selamat datang, {username}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICATION SECTION */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="px-6 py-4 border-b bg-linear-to-r from-orange-50 to-amber-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Semua Notifikasi</h2>
              <p className="text-sm text-gray-600 mt-1">Daftar notifikasi pesanan terbaru</p>
            </div>
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔔</div>
                <p className="text-gray-500 font-medium">Belum ada notifikasi</p>
                <p className="text-sm text-gray-400">Notifikasi baru akan muncul di sini</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id ?? n.kode}
                  className={`p-4 rounded-xl border transition-all flex justify-between items-start ${
                    n.status !== "Sudah Dibayar" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded-xl">
                      <ShoppingCart className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Kode Pesanan: {n.kode}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Status:{" "}
                        <span className={`font-medium ${n.status === "Sudah Dibayar" ? "text-green-600" : "text-orange-700"}`}>
                          {n.status}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 mt-2">{n.items || "Tidak ada info produk"}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.created_at || n.tanggal || ""}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleVerify(n.id, n.kode)}
                      disabled={n.status === "Sudah Dibayar"}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition ${
                        n.status === "Sudah Dibayar"
                          ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                      title={n.status === "Sudah Dibayar" ? "Sudah diverifikasi" : "Verifikasi pembayaran"}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {n.status === "Sudah Dibayar" ? "Terverifikasi" : "Verifikasi"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}