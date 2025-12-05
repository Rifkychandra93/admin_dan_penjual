import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Ambil semua notifikasi dari database
export async function GET() {
  try {
    // Query semua orders dengan items
    const [orders] = await db.query(`
      SELECT 
        o.id,
        o.booking_code,
        o.nama_pemesan,
        o.metode,
        o.total,
        o.status,
        o.tanggal,
        o.created_at
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    // Build notifications dari orders
    const notifications = [];
    
    for (const order of orders) {
      // Ambil items untuk order ini
      const [items] = await db.query(`
        SELECT product_name, qty as quantity, price
        FROM order_items
        WHERE order_id = ?
      `, [order.id]);

      notifications.push({
        id: order.id,
        type: "pesanan",
        title: "Pesanan Baru Masuk! 🎉",
        message: `${order.nama_pemesan} telah melakukan pemesanan dengan kode ${order.booking_code}`,
        time: order.tanggal,
        read: false,
        booking: order.booking_code,
        customerName: order.nama_pemesan,
        totalAmount: order.total,
        items: items
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      notifications 
    });
  } catch (error) {
    console.error("Error reading notifications:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to read notifications",
      notifications: [] 
    }, { status: 500 });
  }
}
