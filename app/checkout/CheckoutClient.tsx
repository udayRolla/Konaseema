"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

const WHATSAPP_NUMBER = "6305419750";

type Shipping = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  deliveryNotes: string;
};

const STORAGE_KEY = "konaseema_shipping_v1";

/* ---------- TABLE FOR WHATSAPP ---------- */
function makeTable(headers: string[], rows: string[][]) {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ? r[i].length : 0)))
  );

  const line = (cols: string[]) =>
    cols.map((c, i) => c + " ".repeat(widths[i] - c.length)).join("  ");

  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  return [line(headers), sep, ...rows.map(line)].join("\n");
}

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [shipping, setShipping] = useState<Shipping>({
    fullName: "",
    email: "",
    phone: "",
    country: "India",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    deliveryNotes: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  /* ================= MOUNT GUARD ================= */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ================= SAFE LOCAL STORAGE ================= */
  useEffect(() => {
    if (!mounted) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setShipping((p) => ({ ...p, ...JSON.parse(raw) }));
    } catch {}
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shipping));
    } catch {}
  }, [shipping, mounted]);

  /* ================= VALIDATION ================= */
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!shipping.fullName.trim()) e.fullName = "Full name is required";
    if (!shipping.email.trim()) e.email = "Email is required";
    if (!shipping.phone.trim()) e.phone = "Phone is required";
    if (!shipping.country.trim()) e.country = "Country is required";
    if (!shipping.address1.trim()) e.address1 = "Address is required";
    if (!shipping.city.trim()) e.city = "City is required";
    if (!shipping.state.trim()) e.state = "State is required";
    if (!shipping.zip.trim()) e.zip = "ZIP is required";
    return e;
  }, [shipping]);

  const isValid = Object.keys(errors).length === 0;

  /* ================= HELPERS ================= */
  const formatPrice = (v: number) => `$${v.toFixed(2)}`;

  const getWeightInKg = (w: string) => {
    if (!w) return 0;
    const value = parseFloat(w);
    if (isNaN(value)) return 0;
    if (w.toLowerCase().includes("kg")) return value;
    if (w.toLowerCase().includes("g")) return value / 1000;
    return 0;
  };

  const getShipping = (weightKg: number) => {
    if (weightKg <= 5) return 29;
    if (weightKg <= 7.5) return 35;
    if (weightKg <= 10) return 40;
    if (weightKg <= 15) return 50;
    return 60;
  };

  const subtotal = useMemo(() => {
    if (!mounted) return 0;
    return cart.items.reduce(
      (s: number, it: any) => s + Number(it.price) * Number(it.qty),
      0
    );
  }, [cart.items, mounted]);

  const totalWeight = useMemo(() => {
    if (!mounted) return 0;
    return cart.items.reduce((sum: number, i: any) => {
      const kg = getWeightInKg(i.weight);
      return sum + kg * i.qty;
    }, 0);
  }, [cart.items, mounted]);

  const shippingFee = mounted && cart.items.length
    ? getShipping(totalWeight)
    : 0;

  const total = Math.max(0, subtotal - discount + shippingFee);

  /* ================= PLACE ORDER ================= */
  const onPlaceOrder = async () => {
    if (!isValid) {
      setSaveError("Please fill all required fields.");
      return;
    }

    const { data: authRes } = await supabase.auth.getUser();

    if (!authRes?.user?.id) {
      setShowLoginModal(true);
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const userId = authRes.user.id;

      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          subtotal,
          total,
          status: "pending",
        })
        .select("id")
        .single();

      if (!order?.id) throw new Error("Failed to create order");

      cart.clear();

      if (mounted) {
        window.location.href = `https://wa.me/${WHATSAPP_NUMBER}`;
      }
    } catch (e: any) {
      setSaveError(e.message || "Failed to place order");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-4xl font-extrabold text-brown mb-8">Checkout</h1>
        </div>
      </main>
      <Footer />
    </>
  );
}
