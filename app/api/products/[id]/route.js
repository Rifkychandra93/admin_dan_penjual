import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// ==============================
// UPDATE PRODUK
// ==============================
export async function PUT(req, context) {
  try {
    // Cara alternatif: ambil ID dari URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    console.log("PUT - URL:", req.url);
    console.log("PUT - Path parts:", pathParts);
    console.log("PUT - ID dari URL:", id);

    const body = await req.json();
    const { name, seller, price, stock, image, category } = body;

    // Validasi ID
    if (!id || id === 'undefined') {
      console.error("PUT - ID tidak valid");
      return NextResponse.json(
        { error: "ID produk tidak ditemukan" },
        { status: 400 }
      );
    }

    console.log("PUT - Updating product ID:", id);
    console.log("PUT - Data:", { name, seller, price, stock, image, category });

    // Update data
    await db.query(
      "UPDATE products SET name=?, seller=?, price=?, stock=?, image=?, category=? WHERE id=?",
      [name, seller, price, stock, image, category, id]
    );

    console.log("PUT - Update berhasil");
    return NextResponse.json({ 
      message: "Updated",
      id: id 
    });
  } catch (error) {
    console.error("PUT ERROR:", error);
    return NextResponse.json({ 
      error: error.message,
      details: "Gagal update produk"
    }, { status: 500 });
  }
}

// ==============================
// DELETE PRODUK
// ==============================
export async function DELETE(req, context) {
  try {
    // Cara alternatif: ambil ID dari URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    console.log("DELETE - URL:", req.url);
    console.log("DELETE - Path parts:", pathParts);
    console.log("DELETE - ID dari URL:", id);
    console.log("DELETE - Tipe ID:", typeof id);

    // Validasi ID
    if (!id || id === 'undefined') {
      console.error("DELETE - ID tidak valid");
      return NextResponse.json(
        { error: "ID produk tidak ditemukan" },
        { status: 400 }
      );
    }

    console.log("DELETE - Menghapus produk dengan ID:", id);

    // Cek dulu apakah produk ada
    const checkProduct = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    console.log("DELETE - Produk ditemukan:", checkProduct);

    if (!checkProduct || checkProduct.length === 0) {
      console.error("DELETE - Produk tidak ditemukan di database");
      return NextResponse.json(
        { error: "Produk tidak ditemukan di database" },
        { status: 404 }
      );
    }

    // Hapus dari database
    const result = await db.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    console.log("DELETE - Result:", result);
    console.log("DELETE - Produk berhasil dihapus");

    return NextResponse.json({ 
      message: "Produk berhasil dihapus",
      id: id,
      success: true
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    console.error("DELETE ERROR Stack:", error.stack);
    return NextResponse.json({ 
      error: error.message,
      details: "Gagal menghapus produk dari database",
      stack: error.stack
    }, { status: 500 });
  }
}