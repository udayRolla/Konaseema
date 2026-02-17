"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const cart = useCart();
  const router = useRouter();

  const formatPrice = (v: number) => `$${Number(v).toFixed(2)}`;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        cart.isOpen ? "" : "pointer-events-none"
      }`}
      aria-hidden={!cart.isOpen}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          cart.isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={cart.close}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#fffaf2] border-l border-gold shadow-2xl transition-transform ${
          cart.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold">
          <div>
            <h3 className="text-2xl font-semibold">Your Cart</h3>
            <p className="opacity-75 text-sm">
              {cart.count} item(s)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {cart.items.length > 0 && (
              <button
                onClick={cart.clear}
                className="text-sm underline opacity-80 hover:opacity-100"
                type="button"
              >
                Clear Cart
              </button>
            )}

            <button
              onClick={cart.close}
              aria-label="Close cart"
              type="button"
            >
              <X />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 space-y-4 overflow-auto h-[calc(100%-250px)]">
          {cart.items.length === 0 ? (
            <div className="opacity-70 text-center mt-10">
              Your cart is empty.
            </div>
          ) : (
            cart.items.map((i) => (
              <div key={i.id} className="premium-card p-4">
                <div className="flex gap-4">
                  <img
                    src={i.image}
                    className="w-16 h-16 rounded-lg object-cover"
                    alt={i.name}
                  />

                  <div className="flex-1">
                    {/* Title + price */}
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="font-semibold">
                          {i.name}
                        </div>
                        <div className="opacity-70 text-sm">
                          {i.weight}
                        </div>
                      </div>
                      <div className="font-bold">
                        {formatPrice(i.price ?? 0)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 border border-gold rounded-full"
                          onClick={() => cart.dec(i.id)}
                          type="button"
                        >
                          −
                        </button>

                        <span className="min-w-[24px] text-center font-semibold">
                          {i.qty}
                        </span>

                        <button
                          className="px-3 py-1 border border-gold rounded-full"
                          onClick={() => cart.inc(i.id)}
                          type="button"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="text-sm underline opacity-80 hover:opacity-100"
                        onClick={() => cart.remove(i.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="mt-2 text-sm opacity-70">
                      Line total:{" "}
                      <span className="font-semibold">
                        {formatPrice((i.price ?? 0) * i.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gold">
          <div className="flex justify-between text-lg mb-4">
            <span className="opacity-80">Subtotal</span>
            <span className="font-bold">
              {formatPrice(cart.total)}
            </span>
          </div>

          <button
            className="btn-primary w-full"
            onClick={() => {
              if (cart.items.length === 0) return;
              cart.close();
              router.push("/checkout");
            }}
            type="button"
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
