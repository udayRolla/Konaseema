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

export default function CheckoutClient() {
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

  /* ================= COUPON (simple, optional) =================
     If you already have your own coupon logic elsewhere, delete this block
     and keep only the UI.
  */
  const onApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setDiscount(0);
      setCouponMsg(null);
      return;
    }

    // Example coupon: KON10 => $10 off
    if (code === "KON10") {
      setDiscount(10);
      setCouponMsg("Coupon applied: $10 off");
      return;
    }

    setDiscount(0);
    setCouponMsg("Invalid coupon code");
  };

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

      // Optional detailed WhatsApp message (keeps your helper)
      const headers = ["Item", "Weight", "Qty", "Price"];
      const rows = (cart.items || []).map((i: any) => [
        String(i.name ?? ""),
        String(i.weight ?? ""),
        String(i.qty ?? ""),
        formatPrice(Number(i.price) * Number(i.qty)),
      ]);

      const table = makeTable(headers, rows);

      const message =
        `🛒 *New Order #${order.id}*\n\n` +
        `*Customer:* ${shipping.fullName}\n` +
        `*Phone:* ${shipping.phone}\n` +
        `*Address:* ${shipping.address1}, ${shipping.city}, ${shipping.state} ${shipping.zip}, ${shipping.country}\n\n` +
        `\`\`\`\n${table}\n\`\`\`\n\n` +
        `Subtotal: ${formatPrice(subtotal)}\n` +
        `Discount: ${formatPrice(discount)}\n` +
        `Shipping: ${formatPrice(shippingFee)}\n` +
        `*Total: ${formatPrice(total)}*`;

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

  // small helper for inputs
  const inputClass =
    "w-full rounded-2xl border border-gold bg-cream/60 px-4 py-3 outline-none";

  const showErr = (k: keyof Shipping) => touched[k] && errors[k];

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

          {/* Messages */}
          {saveError && (
            <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              {saveError}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-green-700">
              {successMsg}
            </div>
          )}

          {/* ===== ORIGINAL-STYLE LAYOUT (Left form / Right summary) ===== */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* LEFT: SHIPPING */}
            <div className="premium-card p-6">
              <h2 className="text-2xl font-extrabold text-brown mb-4">
                Shipping Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Full Name"
                    value={shipping.fullName}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, fullName: e.target.value }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                  />
                  {showErr("fullName") && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    className={inputClass}
                    placeholder="Email"
                    value={shipping.email}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, email: e.target.value }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  />
                  {showErr("email") && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    className={inputClass}
                    placeholder="Phone"
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, phone: e.target.value }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  />
                  {showErr("phone") && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Address Line 1"
                    value={shipping.address1}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, address1: e.target.value }))
                    }
                    onBlur={() =>
                      setTouched((t) => ({ ...t, address1: true }))
                    }
                  />
                  {showErr("address1") && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.address1}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Address Line 2 (optional)"
                    value={shipping.address2}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, address2: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <input
                    className={inputClass}
                    placeholder="City"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, city: e.target.value }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                  />
                  {showErr("city") && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.city}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    className={inputClass}
                    placeholder="State"
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, state: e.target.value }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, state: true }))}
                  />
                  {showErr("state") && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.state}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    className={inputClass}
                    placeholder="ZIP / Postal Code"
                    value={shipping.zip}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, zip: e.target.value }))
                    }
                    onBlur={() => setTouched((t) => ({ ...t, zip: true }))}
                  />
                  {showErr("zip") && (
                    <div className="mt-1 text-sm text-red-600">{errors.zip}</div>
                  )}
                </div>

                <div>
                  <input
                    className={inputClass}
                    placeholder="Country"
                    value={shipping.country}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, country: e.target.value }))
                    }
                    onBlur={() =>
                      setTouched((t) => ({ ...t, country: true }))
                    }
                  />
                  {showErr("country") && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.country}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-[110px]`}
                    placeholder="Delivery Notes (optional)"
                    value={shipping.deliveryNotes}
                    onChange={(e) =>
                      setShipping((p) => ({
                        ...p,
                        deliveryNotes: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="premium-card p-6">
              <h2 className="text-2xl font-extrabold text-brown mb-4">
                Order Summary
              </h2>

              {/* Items */}
              {cart.items?.length ? (
                <div className="space-y-3">
                  {cart.items.map((item: any, idx: number) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="font-semibold text-brown">
                          {item.name}{" "}
                          <span className="opacity-70 font-normal">
                            × {item.qty}
                          </span>
                        </div>
                        {item.weight && (
                          <div className="text-sm opacity-70">{item.weight}</div>
                        )}
                      </div>
                      <div className="font-semibold">
                        {formatPrice(Number(item.price) * Number(item.qty))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="opacity-70">Your cart is empty.</div>
              )}

              {/* Coupon */}
              <div className="mt-6">
                <div className="font-semibold text-brown mb-2">Coupon Code</div>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon"
                    className="flex-1 rounded-2xl border border-gold bg-cream/60 px-4 py-3 outline-none"
                  />
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    className="rounded-2xl border border-gold px-5 py-3 font-semibold"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <div className="mt-2 text-sm opacity-80">{couponMsg}</div>
                )}
              </div>

              {/* Totals */}
              <div className="mt-6 border-t border-gold/40 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-80">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="opacity-80">Discount</span>
                  <span className="font-semibold">
                    -{formatPrice(discount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="opacity-80">Shipping</span>
                  <span className="font-semibold">
                    {formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-extrabold text-brown pt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={saving || !cart.items?.length}
                onClick={onPlaceOrder}
                className="btn-primary w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Placing Order..." : "Place Order"}
              </button>

              {!cart.items?.length && (
                <div className="mt-3 text-sm opacity-70">
                  Add items to your cart to continue.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
