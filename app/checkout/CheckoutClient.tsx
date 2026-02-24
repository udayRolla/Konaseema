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

export default function CheckoutClient() {
  const cart = useCart() || { items: [], clear: () => {}, close: () => {} };
  const router = useRouter();

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

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  /* ================= LOCAL STORAGE ================= */

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setShipping((p) => ({ ...p, ...JSON.parse(raw) }));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipping));
  }, [shipping]);

  /* ================= HELPERS ================= */

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
    return (cart.items || []).reduce(
      (s: number, it: any) => s + Number(it.price) * Number(it.qty),
      0
    );
  }, [cart.items]);

  const totalWeight = useMemo(() => {
    return (cart.items || []).reduce((sum: number, i: any) => {
      const kg = getWeightInKg(i.weight);
      return sum + kg * i.qty;
    }, 0);
  }, [cart.items]);

  const shippingFee = cart.items?.length ? getShipping(totalWeight) : 0;
  const total = Math.max(0, subtotal - discount + shippingFee);

  /* ================= PLACE ORDER ================= */

  const onPlaceOrder = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      const { data: authRes } = await supabase.auth.getUser();
      if (!authRes?.user?.id) {
        router.push("/?login=1&redirect=/checkout");
        return;
      }

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

      cart.clear?.();
      setSuccessMsg(`Order placed successfully. Order ID: ${order.id}`);

      const message = `🛒 *New Order #${order.id}*\nTotal: $${total.toFixed(2)}`;

      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
      )}`;
    } catch (e: any) {
      setSaveError(e.message || "Failed to place order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-cream pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-4xl font-extrabold text-brown mb-8">
            Checkout
          </h1>

          <div className="grid md:grid-cols-2 gap-10">
            {/* LEFT: SHIPPING FORM */}
            <div className="premium-card p-6 space-y-4">
              <h2 className="text-2xl font-bold text-brown">
                Shipping Details
              </h2>

              {Object.keys(shipping).map((key) => (
                <input
                  key={key}
                  value={(shipping as any)[key]}
                  onChange={(e) =>
                    setShipping((p) => ({
                      ...p,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder={key}
                  className="w-full border border-gold rounded-xl px-4 py-2"
                />
              ))}
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="premium-card p-6 space-y-4">
              <h2 className="text-2xl font-bold text-brown">
                Order Summary
              </h2>

              {cart.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center"
                >
                  <div>
                    {item.name} ({item.weight}) × {item.qty}
                  </div>
                  <div>
                    $
                    {(Number(item.price) * Number(item.qty)).toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shippingFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onPlaceOrder}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-green-800 text-white font-bold hover:bg-green-900"
              >
                {saving ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
