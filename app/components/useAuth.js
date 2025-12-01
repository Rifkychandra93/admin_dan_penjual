// components/useAuth.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuth(requiredRole) {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      router.push("/login");
      return;
    }
    if (requiredRole && role !== requiredRole) {
      router.push("/home"); // atau halaman lain
      return;
    }
  }, [router, requiredRole]);
}
