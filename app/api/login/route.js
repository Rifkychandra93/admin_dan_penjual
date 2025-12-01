import { db } from "@/lib/db"
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, password, role } = await request.json();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? AND role = ? LIMIT 1",
      [username, role]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan" },
        { status: 404 }
      );
    }

    const user = rows[0];

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: "Password salah" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        username: user.username,
        role: user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
