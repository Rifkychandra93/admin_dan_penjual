// app/api/orders/[id]/route.js
import { db } from "@/lib/db";
export async function PUT(req, { params }) {
  const body = await req.json();
  const status = body.status || "Sudah Dibayar";
  await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, params.id]);
  return new Response(JSON.stringify({ ok: true }));
}
