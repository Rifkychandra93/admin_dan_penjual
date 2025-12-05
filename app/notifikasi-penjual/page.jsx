"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, ShoppingCart, Package, Clock, CheckCircle, Trash2, Filter } from "lucide-react";

export default function NotifikasiPenjual() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("semua");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (!role || !username) {
      router.push("/login");
      return;
    }

    if (role !== "penjual") {
      router.push("/home");
      return;
    }

    setUser({ role, username });

    // Load notifikasi dari database
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notif/penjual");
        const data = await res.json();
        
        if (data.success) {
          setNotifications(data.notifications);
          // Update localStorage juga untuk backup
          localStorage.setItem("notif_penjual", JSON.stringify(data.notifications));
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Fallback ke localStorage jika API gagal
        const notif = JSON.parse(localStorage.getItem("notif_penjual")) || [];
        setNotifications(notif);
      }
    };

    fetchNotifications();
  }, [router]);

  // Filter notifikasi
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "semua") return true;
    if (filter === "dibaca") return notif.read;
    if (filter === "belum") return !notif.read;
    return true;
  });

  // Tandai sebagai dibaca (hanya UI)
  const handleMarkAsRead = (id) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
  };

  // Tandai semua sebagai dibaca (hanya UI)
  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({ 
      ...notif, 
      read: true 
    }));
    setNotifications(updatedNotifications);
  };

  // Hapus notifikasi (hanya dari UI)
  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  // Hapus semua notifikasi (hanya dari UI)
  const handleDeleteAll = () => {
    setNotifications([]);
  };

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "pesanan":
        return <ShoppingCart className="w-5 h-5" />;
      case "stok":
        return <Package className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get color based on notification type
  const getColor = (type) => {
    switch (type) {
      case "pesanan":
        return "bg-green-100 text-green-600";
      case "stok":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard-penjual")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="bg-linear-to-br from-orange-400 to-red-500 p-3 rounded-xl shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
                <p className="text-sm text-gray-600">
                  {unreadCount} notifikasi belum dibaca
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="hidden sm:flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl transition-all font-medium text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Tandai Semua Dibaca
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="hidden sm:flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl transition-all font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Semua
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 justify-between flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Filter:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("semua")}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  filter === "semua"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semua ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("belum")}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  filter === "belum"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Belum Dibaca ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("dibaca")}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  filter === "dibaca"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Dibaca ({notifications.length - unreadCount})
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex sm:hidden gap-2 mb-6">
            <button
              onClick={handleMarkAllAsRead}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-xl transition-all font-medium text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Tandai Semua
            </button>
            <button
              onClick={handleDeleteAll}
              className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-xl transition-all font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Semua
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filter === "semua"
                  ? "Belum ada notifikasi"
                  : filter === "belum"
                  ? "Semua notifikasi sudah dibaca"
                  : "Belum ada notifikasi yang dibaca"}
              </h3>
              <p className="text-gray-600">
                {filter === "semua"
                  ? "Notifikasi pesanan dan update stok akan muncul di sini"
                  : "Coba filter lain untuk melihat notifikasi"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  !notif.read ? "border-l-4 border-orange-500" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${getColor(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="flex-`shrink`-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{notif.message}</p>
                      
                      {/* Detail Pesanan */}
                      {notif.type === "pesanan" && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                          {notif.booking && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Kode Booking:</span>
                              <span className="font-semibold text-gray-800">{notif.booking}</span>
                            </div>
                          )}
                          {notif.customerName && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Nama Pembeli:</span>
                              <span className="font-semibold text-gray-800">{notif.customerName}</span>
                            </div>
                          )}
                          {notif.totalAmount && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Total Belanja:</span>
                              <span className="font-bold text-green-600">
                                Rp {notif.totalAmount.toLocaleString('id-ID')}
                              </span>
                            </div>
                          )}
                          {notif.items && notif.items.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-xs font-semibold text-gray-700 mb-1 block">Item yang dipesan:</span>
                              <ul className="space-y-1">
                                {notif.items.map((item, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex justify-between">
                                    <span>• {item.product_name}</span>
                                    <span className="font-medium text-gray-800">
                                      {item.quantity}x @ Rp {item.price.toLocaleString('id-ID')}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{notif.time}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all"
                          title="Tandai sebagai dibaca"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}