"use client";

import NotificationItem from "@/components/NotificationItem";
import { useEffect, useState } from "react";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Contoh data (nanti diganti API backend / MySQL)
    setNotifications([
      {
        id: 1,
        title: "Pembayaran Berhasil",
        message: "Booking #101 telah dibayar oleh pembeli.",
        time: "5 menit lalu",
        isRead: false,
      },
      {
        id: 2,
        title: "Pesanan Baru",
        message: "Pesanan baru masuk dari Warung A.",
        time: "20 menit lalu",
        isRead: true,
      },
    ]);
  }, []);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-900 mb-4">Notifikasi Admin</h1>

      <div className="space-y-3">
        {notifications.map((n) => (
          <NotificationItem key={n.id} {...n} />
        ))}
      </div>
    </main>
  );
}
