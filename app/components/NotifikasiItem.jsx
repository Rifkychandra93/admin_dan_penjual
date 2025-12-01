// components/NotificationItem.jsx
import { Bell, CheckCircle } from "lucide-react";

export default function NotificationItem({ title, message, time, isRead }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border 
      ${isRead ? "bg-white/50" : "bg-indigo-50 border-indigo-300/40"}`}
    >
      <Bell className="text-indigo-600" />

      <div className="flex-1">
        <h3 className="font-semibold text-indigo-900 text-sm">{title}</h3>
        <p className="text-indigo-700/80 text-sm">{message}</p>

        <span className="text-xs text-indigo-500">{time}</span>
      </div>

      {!isRead && <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">Baru</span>}
    </div>
  );
}
