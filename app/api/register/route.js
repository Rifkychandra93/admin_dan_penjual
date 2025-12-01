import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // cek username sudah ada atau belum
    const [existUser] = await db.query(
      "SELECT username FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (existUser.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan!" },
        { status: 409 }
      );
    }

    // insert user baru
    await db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, password, role]
    );

    return NextResponse.json(
      { success: true, message: "Registrasi berhasil!" },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
