"use client";

import NotificationItem from "@/components/NotificationItem";
import { useEffect, useState } from "react";

export default function SellerNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const sellerName = localStorage.getItem("username") || "Warung A";

    // Contoh data 
    setNotifications([
      {
        id: 1,
        title: "Pesanan Baru",
        message: `Pembeli memesan Ayam Geprek di ${sellerName}`,
        time: "3 menit lalu",
        isRead: false,
      },
      {
        id: 2,
        title: "Pesanan Siap",
        message: "Pesanan sebelumnya sudah diambil.",
        time: "1 jam lalu",
        isRead: true,
      },
    ]);
  }, []);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-900 mb-4">Notifikasi Penjual</h1>

      <div className="space-y-3">
        {notifications.map((n) => (
          <NotificationItem key={n.id} {...n} />
        ))}
      </div>
    </main>
  );
}
