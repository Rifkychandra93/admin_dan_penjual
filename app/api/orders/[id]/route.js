import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// ==============================
// GET ORDER BY ID
// ==============================
export async function GET(req, context) {
  try {
    // Ambil ID dari context
    const params = await context.params;
    const id = params.id;

    console.log("GET - Order ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "ID order tidak ditemukan" },
        { status: 400 }
      );
    }

    // Query order dari database
    const orders = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders[0]
    });

  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ==============================
// VERIFIKASI PEMBAYARAN ORDER
// ==============================
export async function PUT(req, context) {
  try {
    // Ambil ID dari context
    const params = await context.params;
    const id = params.id;

    console.log("=== VERIFIKASI PEMBAYARAN ===");
    console.log("Order ID:", id);

    if (!id) {
      console.error("ID tidak ditemukan");
      return NextResponse.json(
        { error: "ID order tidak ditemukan" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const newStatus = body.status || "Sudah Dibayar";

    console.log("Status yang akan diset:", newStatus);

    // Cek apakah order ada
    const checkOrder = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );

    if (!checkOrder || checkOrder.length === 0) {
      console.error("Order tidak ditemukan di database");
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    const currentOrder = checkOrder[0];
    console.log("Order ditemukan:");
    console.log("- Kode Booking:", currentOrder.booking_code);
    console.log("- Status saat ini:", currentOrder.status);
    console.log("- Nama Pemesan:", currentOrder.nama_pemesan);

    // Cek apakah sudah pernah diverifikasi
    if (currentOrder.status === "Sudah Dibayar" || currentOrder.status === "Lunas") {
      console.log("⚠️ Order sudah pernah diverifikasi");
      return NextResponse.json({
        success: false,
        message: "Order sudah diverifikasi sebelumnya",
        data: currentOrder
      }, { status: 400 });
    }

    // Update status order menjadi "Sudah Dibayar"
    const result = await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [newStatus, id]
    );

    console.log("✅ Status berhasil diupdate ke:", newStatus);
    console.log("Database update result:", result);

    // Get updated order untuk konfirmasi
    const updatedOrder = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );

    console.log("Order setelah update:", updatedOrder[0]);
    console.log("=== VERIFIKASI SELESAI ===");

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil diverifikasi",
      data: {
        id: updatedOrder[0].id,
        booking_code: updatedOrder[0].booking_code,
        status: updatedOrder[0].status,
        nama_pemesan: updatedOrder[0].nama_pemesan,
        total: updatedOrder[0].total
      }
    });

  } catch (error) {
    console.error("❌ ERROR VERIFIKASI PEMBAYARAN:", error);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: error.message, 
        details: "Gagal memverifikasi pembayaran" 
      },
      { status: 500 }
    );
  }
}