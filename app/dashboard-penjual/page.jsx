"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Trash2, Edit, Plus, Bell, Package, DollarSign, TrendingUp, LogOut, Save, X, Search, Filter } from "lucide-react";

export default function DashboardPenjual() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    seller: "",
    price: "",
    image: "",
    stock: "",
    category: "Makanan Berat",
  });

  const [isEditing, setIsEditing] = useState(false);

  const categories = ["Makanan Berat", "Snack", "Minuman", "Dessert"];

  // ============================
  // LOAD USER + PRODUK
  // ============================
  useEffect(() => {
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (!role || !username) {
      router.push("/login");
      return;
    }

    if (role !== "penjual") {
      router.push("/home");
      return;
    }

    setUser({ role, username });

    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      console.log("===================DATAFETCH=============", data);
      setProducts(data);
      setFilteredProducts(data);
    };

    fetchProducts();

    const notif = JSON.parse(localStorage.getItem("notif_penjual")) || [];
    setNotifCount(notif.length);
  }, [router]);

  // ============================
  // FILTER PRODUK
  // ============================
  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // ============================
  // STATISTIK PRODUK
  // ============================
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce(
    (sum, p) => sum + (p.price * p.stock || 0),
    0
  );

  // ============================
  // FORM CHANGE
  // ============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================
  // TAMBAH PRODUK
  // ============================
  const handleAdd = async () => {
    if (!form.name || !form.price || !form.image || !form.stock) {
      Swal.fire({
        title: "Lengkapi data!",
        text: "Semua field harus diisi",
        icon: "warning",
      });
      return;
    }

    const newProduct = {
      ...form,
      seller: user.username,
      price: parseInt(form.price),
      stock: parseInt(form.stock),
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    const data = await res.json();
    setProducts([data, ...products]);

    // reset form
    setForm({
      id: null,
      name: "",
      seller: "",
      price: "",
      image: "",
      stock: "",
      category: "Makanan Berat",
    });

    setShowForm(false);

    Swal.fire({
      title: "Berhasil!",
      text: "Produk ditambahkan",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // ============================
  // EDIT PRODUK - FIXED: Pass item object, bukan item.id
  // ============================
  const handleEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name,
      seller: item.seller,
      price: item.price,
      image: item.image,
      stock: item.stock,
      category: item.category,
    });

    setIsEditing(true);
    setShowForm(true);
  };

  // ============================
  // UPDATE PRODUK
  // ============================
  const handleUpdate = async () => {
    if (!form.name || !form.price || !form.image || !form.stock) {
      Swal.fire({
        title: "Lengkapi data!",
        text: "Semua field harus diisi",
        icon: "warning",
      });
      return;
    }

    await fetch(`/api/products/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        seller: form.seller,
        price: parseInt(form.price),
        stock: parseInt(form.stock),
        image: form.image,
        category: form.category,
      }),
    });

    // Refetch semua produk
    const res = await fetch("/api/products");
    const updated = await res.json();
    setProducts(updated);

    // reset form
    setForm({
      id: null,
      name: "",
      seller: "",
      price: "",
      image: "",
      stock: "",
      category: "Makanan Berat",
    });

    setIsEditing(false);
    setShowForm(false);

    Swal.fire({
      title: "Berhasil!",
      text: "Produk diperbarui",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // ============================
  // DELETE PRODUK - FIXED: Refetch data setelah delete
  // ============================
  const handleDelete = async (id) => {
    console.log("=== handleDelete dipanggil ===");
    console.log("ID yang akan dihapus:", id);
    console.log("Tipe ID:", typeof id);

    const confirm = await Swal.fire({
      title: "Yakin ingin hapus?",
      text: "Produk akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) {
      console.log("User membatalkan delete");
      return;
    }

    try {
      console.log("Mengirim DELETE request ke:", `/api/products/${id}`);
      
      const res = await fetch(`/api/products/${id}`, { 
        method: "DELETE" 
      });

      console.log("Response status:", res.status);
      console.log("Response OK:", res.ok);

      const responseData = await res.json();
      console.log("Response data:", responseData);

      if (!res.ok) {
        throw new Error(responseData.error || "Gagal menghapus produk");
      }

      // Refetch semua produk setelah delete
      console.log("Refetching products...");
      const refreshRes = await fetch("/api/products");
      const updatedProducts = await refreshRes.json();
      console.log("Updated products:", updatedProducts);
      
      setProducts(updatedProducts);

      Swal.fire({
        title: "Dihapus!",
        text: "Produk berhasil dihapus",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("=== ERROR DELETE ===");
      console.error("Error message:", error.message);
      console.error("Error object:", error);
      
      Swal.fire({
        title: "Error!",
        text: error.message || "Gagal menghapus produk",
        icon: "error",
      });
    }
  };

  // ============================
  // CANCEL FORM
  // ============================
  const handleCancel = () => {
    setForm({
      id: null,
      name: "",
      seller: "",
      price: "",
      image: "",
      stock: "",
      category: "Makanan Berat",
    });
    setIsEditing(false);
    setShowForm(false);
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-orange-400 to-red-500 p-3 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Dashboard Penjual
                </h1>
                <p className="text-sm text-gray-600">Halo, {user.username}!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/notifikasi-penjual")}
                className="relative bg-orange-100 hover:bg-orange-200 p-3 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5 text-orange-600" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Produk</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalProducts}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Stok</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalStock}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Nilai Inventori</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  Rp {totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-orange-100 p-4 rounded-xl">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setIsEditing(false);
                setForm({ id: null, name: "", seller: "", price: "", image: "", stock: "", category: "Makanan Berat" });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Produk
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Contoh: Nasi Goreng Spesial"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="15000"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stok
                </label>
                <input
                  type="number"
                  name="stock"
                  placeholder="50"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Gambar
                </label>
                <input
                  type="text"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {isEditing ? (
                <button
                  onClick={handleUpdate}
                  className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  Update Produk
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Produk
                </button>
              )}

              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Daftar Produk</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {filteredProducts.length} Produk
                </span>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Belum ada produk
              </h3>
              <p className="text-gray-600">
                Klik tombol "Tambah Produk" untuk menambahkan produk pertama
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || "/default-food.jpg"}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {item.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          {item.category || "Lainnya"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          Rp {item.price.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.stock > 20
                              ? "bg-green-100 text-green-700"
                              : item.stock > 0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.stock} unit
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}