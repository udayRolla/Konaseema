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
  const cart = useCart() || { items: [], clear: () => {} };
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

  /* ================= CALCULATIONS ================= */

  const getWeightInKg = (w: string) => {
    if (!w) return 0;
    const v = parseFloat(w);
    if (isNaN(v)) return 0;
    if (w.toLowerCase().includes("kg")) return v;
    if (w.toLowerCase().includes("g")) return v / 1000;
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
      return sum + getWeightInKg(i.weight) * i.qty;
    }, 0);
  }, [cart.items]);

  const shippingFee = cart.items?.length ? getShipping(totalWeight) : 0;
  const total = subtotal + shippingFee;

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

      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          subtotal,
          shipping: shippingFee,
          total,
          status: "pending",
        })
        .select("id")
        .single();

      if (!order?.id) throw new Error("Order failed");

      await supabase.from("order_items").insert(
        cart.items.map((i: any) => ({
          order_id: order.id,
          product_id: String(i.id),
          name: i.name,
          price: i.price,
          qty: i.qty,
        }))
      );

      cart.clear?.();

      window.location.href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=` +
        encodeURIComponent(
          `New Order #${order.id}\nTotal: $${total.toFixed(2)}`
        );
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle =
    "w-full rounded-2xl border border-[#c9a45c] bg-[#f6efe6] px-4 py-3 outline-none";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#efe7db] pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-[#3b2417] mb-12">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* LEFT - ORDER SUMMARY */}
            <div>
              <h2 className="text-2xl font-bold text-[#3b2417] mb-6">
                Order Summary
              </h2>

              {cart.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between py-2 border-b border-[#e2d2b6]"
                >
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>
                    Shipping ({totalWeight.toFixed(2)} kg)
                  </span>
                  <span>${shippingFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold mt-3">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* RIGHT - SHIPPING DETAILS */}
            <div>
              <h2 className="text-2xl font-bold text-[#3b2417] mb-6">
                Shipping Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  className={inputStyle}
                  placeholder="Full Name *"
                  value={shipping.fullName}
                  onChange={(e) =>
                    setShipping({ ...shipping, fullName: e.target.value })
                  }
                />

                <input
                  className={inputStyle}
                  placeholder="Email *"
                  value={shipping.email}
                  onChange={(e) =>
                    setShipping({ ...shipping, email: e.target.value })
                  }
                />

                <input
                  className={inputStyle}
                  placeholder="Phone *"
                  value={shipping.phone}
                  onChange={(e) =>
                    setShipping({ ...shipping, phone: e.target.value })
                  }
                />

                <input
                  className={inputStyle}
                  placeholder="Country *"
                  value={shipping.country}
                  onChange={(e) =>
                    setShipping({ ...shipping, country: e.target.value })
                  }
                />

                <input
                  className={`${inputStyle} sm:col-span-2`}
                  placeholder="Address Line 1 *"
                  value={shipping.address1}
                  onChange={(e) =>
                    setShipping({ ...shipping, address1: e.target.value })
                  }
                />

                <input
                  className={`${inputStyle} sm:col-span-2`}
                  placeholder="Address Line 2"
                  value={shipping.address2}
                  onChange={(e) =>
                    setShipping({ ...shipping, address2: e.target.value })
                  }
                />

                <input
                  className={inputStyle}
                  placeholder="City *"
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping({ ...shipping, city: e.target.value })
                  }
                />

                <input
                  className={inputStyle}
                  placeholder="State *"
                  value={shipping.state}
                  onChange={(e) =>
                    setShipping({ ...shipping, state: e.target.value })
                  }
                />

                <input
                  className={`${inputStyle} sm:col-span-2`}
                  placeholder="ZIP / Postal *"
                  value={shipping.zip}
                  onChange={(e) =>
                    setShipping({ ...shipping, zip: e.target.value })
                  }
                />

                <textarea
                  className={`${inputStyle} sm:col-span-2 min-h-[120px]`}
                  placeholder="Delivery Notes"
                  value={shipping.deliveryNotes}
                  onChange={(e) =>
                    setShipping({
                      ...shipping,
                      deliveryNotes: e.target.value,
                    })
                  }
                />
              </div>

              <button
                onClick={onPlaceOrder}
                disabled={saving || !cart.items?.length}
                className="w-full mt-10 bg-[#1f3a2a] text-white py-4 rounded-2xl font-bold hover:opacity-90"
              >
                {saving
                  ? "Placing Order..."
                  : `Place Order ($${total.toFixed(2)})`}
              </button>

              {saveError && (
                <div className="mt-4 text-red-600 text-sm">
                  {saveError}
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
