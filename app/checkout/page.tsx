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
  const cart = useCart() || { items: [], clear: () => {}, close: () => {} };
  const router = useRouter();

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

  /* ================= SAFE LOCAL STORAGE ================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setShipping((p) => ({ ...p, ...JSON.parse(raw) }));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shipping));
    } catch {}
  }, [shipping]);

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

  const subtotal = (cart.items || []).reduce(
    (s: number, it: any) => s + Number(it.price) * Number(it.qty),
    0
  );

  const totalWeight = (cart.items || []).reduce((sum: number, i: any) => {
    const kg = getWeightInKg(i.weight);
    return sum + kg * i.qty;
  }, 0);

  const shippingFee = cart.items?.length ? getShipping(totalWeight) : 0;

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

      const { data: addr } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          full_name: shipping.fullName,
          email: shipping.email,
          phone: shipping.phone,
          address_line1: shipping.address1,
          address_line2: shipping.address2 || null,
          city: shipping.city,
          state: shipping.state,
          postal_code: shipping.zip,
          country: shipping.country,
        })
        .select("id")
        .single();

      if (!addr?.id) throw new Error("Failed to save address");

      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          address_id: addr.id,
          subtotal,
          discount_amount: discount,
          coupon_code: coupon || null,
          shipping: shippingFee,
          total,
          status: "pending",
        })
        .select("id")
        .single();

      if (!order?.id) throw new Error("Failed to create order");

      await supabase.from("order_items").insert(
        (cart.items || []).map((i: any) => ({
          order_id: order.id,
          product_id: String(i.id),
          name: i.name,
          price: Number(i.price),
          qty: Number(i.qty),
        }))
      );

      const message = `🛒 *New Order #${order.id}*\n\nTotal: ${formatPrice(total)}`;

      cart.clear?.();
      setSuccessMsg(`Order placed successfully. Order ID: ${order.id}`);

      if (typeof window !== "undefined") {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          message
        )}`;
        window.location.href = url;
      }
    } catch (e: any) {
      setSaveError(e.message || "Failed to place order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[#fffaf2] border border-gold p-6 shadow-xl">
            <h3 className="text-xl font-extrabold text-brown">Please login</h3>
            <div className="mt-6 flex gap-3">
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  setShowLoginModal(false);
                  router.push("/?login=1&redirect=/checkout");
                }}
              >
                Login
              </button>
              <button
                className="flex-1 rounded-2xl border border-gold px-4 py-3 font-semibold"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-cream pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-4xl font-extrabold text-brown mb-8">Checkout</h1>
        </div>
      </main>

      <Footer />
    </>
  );
}
