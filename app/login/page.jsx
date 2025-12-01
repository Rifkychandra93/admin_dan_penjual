"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { LogIn, Lock, User, ChevronRight, ShoppingBag, Shield } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState("penjual");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role,
        }),
      });
  
      const data = await res.json();
  
      if (!data.success) {
        Swal.fire("Gagal!", data.message, "error");
        setLoading(false);
        return;
      }
  
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
  
      await Swal.fire("Berhasil!", "Login berhasil!", "success");
  
      if (data.role === "admin") {
        router.push("/dashboard-admin");
      } else {
        router.push("/dashboard-penjual");
      }
  
    } catch (error) {
      Swal.fire("Error!", "Terjadi kesalahan server", "error");
    }
  
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(e);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2 rounded-xl shadow-lg">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Kantin Seistar
                </h1>
                <p className="text-xs text-gray-500">Login ke Akun Anda</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4 shadow-lg">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Selamat Datang
                </h2>
                <p className="text-gray-600">
                  Silakan login sesuai peran Anda untuk melanjutkan
                </p>
              </div>

              {/* Form */}
              <div className="space-y-5">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("penjual")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        role === "penjual"
                          ? "border-orange-500 bg-orange-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">🛒</div>
                      <div className="text-sm font-semibold text-gray-800">Penjual</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        role === "admin"
                          ? "border-orange-500 bg-orange-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">👨‍💼</div>
                      <div className="text-sm font-semibold text-gray-800">Admin</div>
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(e);
                        }
                      }}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                      placeholder="Masukkan username"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(e);
                        }
                      }}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
                      placeholder={`Password untuk ${role}`}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Sekarang</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Belum memiliki akun?{" "}
                  <button
                    onClick={() => router.push("/")}
                    className="text-orange-600 font-semibold hover:text-orange-700 hover:underline"
                  >
                    Register Sekarang
                  </button>
                </p>
              </div>
            </div>

            {/* Quick Access Info */}
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">
                    Akses Cepat
                  </h4>
                  <p className="text-xs text-gray-600">
                    Login sebagai {role === "penjual" ? "Penjual" : "Admin"} untuk mengelola menu dan pesanan dengan mudah.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col items-center justify-center lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-12 shadow-2xl">
                <div className="text-center">
                  <div className="text-8xl mb-6">🍱</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Dashboard Manajemen
                  </h2>
                  <p className="text-gray-600 text-lg mb-6">
                    Kelola kantin Anda dengan sistem yang modern dan efisien
                  </p>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg mt-1">
                        <Shield className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Keamanan Terjamin</h3>
                        <p className="text-sm text-gray-600">Data dan transaksi Anda dilindungi dengan enkripsi</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg mt-1">
                        <span className="text-2xl">📈</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Laporan Real-time</h3>
                        <p className="text-sm text-gray-600">Pantau penjualan dan stok secara langsung</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg mt-1">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Mudah Digunakan</h3>
                        <p className="text-sm text-gray-600">Interface intuitif untuk efisiensi maksimal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-lg">
              <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-2xl font-bold text-gray-800">500+</div>
                <div className="text-xs text-gray-600">Produk</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-gray-800">50+</div>
                <div className="text-xs text-gray-600">Penjual</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-gray-800">4.8</div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p className="font-semibold mb-1">Kantin Seistar</p>
            <p>Melayani dengan sepenuh hati 💖</p>
          </div>
        </div>
      </footer>
    </main>
  );
}