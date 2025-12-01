import { db } from "@/lib/db";

// GET semua produk
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM products");

    return Response.json(rows, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST tambah produk
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, seller, price, stock, image, category } = body;

    const [result] = await db.query(
      "INSERT INTO products (name, seller, price, stock, image, category) VALUES (?, ?, ?, ?, ?, ?)",
      [name, seller, price, stock, image, category]
    );

    return Response.json(
      { id: result.insertId, ...body },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
