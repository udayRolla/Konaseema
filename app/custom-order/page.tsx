
"use client";


import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";
import { getProductsFromSheet, ProductFromSheet } from "../lib/sheetProducts";

type WeightKey = "250g" | "500g" | "1kg";

type SelectedItem = {
  product: ProductFromSheet;
  weight: WeightKey;
  qty: number;
};

const WEIGHT_TO_KG: Record<WeightKey, number> = {
  "250g": 0.25,
  "500g": 0.5,
  "1kg": 1,
};

function firstAvailableWeight(p: ProductFromSheet): WeightKey {
  const order: WeightKey[] = ["250g", "500g", "1kg"];
  for (const w of order) if ((p.prices?.[w] ?? 0) > 0) return w;
  return "1kg";
}

export default function CustomOrderPage() {
  const router = useRouter();
  const cart = useCart();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductFromSheet[]>([]);
  const [query, setQuery] = useState("");

  // Selected keyed by base product id
  const [selected, setSelected] = useState<Record<string, SelectedItem>>({});

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getProductsFromSheet();

        // only show live and in-stock items
        const clean = (data || []).filter((p) => p.is_live && !p.out_of_stock);
        if (!alive) return;
        setProducts(clean);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  const selectedList = useMemo(() => Object.values(selected), [selected]);

  const totalWeightKg = useMemo(() => {
    return selectedList.reduce(
      (sum, it) => sum + WEIGHT_TO_KG[it.weight] * it.qty,
      0
    );
  }, [selectedList]);

  const totalPrice = useMemo(() => {
    return selectedList.reduce((sum, it) => {
      const price = it.product.prices?.[it.weight] ?? 0;
      return sum + price * it.qty;
    }, 0);
  }, [selectedList]);

  const canCheckout = totalWeightKg >= 5;

  const addOrUpdate = (p: ProductFromSheet) => {
    setSelected((prev) => {
      const existing = prev[p.id];
      if (existing) return prev; // already added
      const w = firstAvailableWeight(p);
      return {
        ...prev,
        [p.id]: { product: p, weight: w, qty: 1 },
      };
    });
  };

  const updateWeight = (id: string, w: WeightKey) => {
    setSelected((prev) => {
      const it = prev[id];
      if (!it) return prev;
      return { ...prev, [id]: { ...it, weight: w } };
    });
  };

  const inc = (id: string) => {
    setSelected((prev) => {
      const it = prev[id];
      if (!it) return prev;
      return { ...prev, [id]: { ...it, qty: it.qty + 1 } };
    });
  };

  const dec = (id: string) => {
    setSelected((prev) => {
      const it = prev[id];
      if (!it) return prev;
      const nextQty = it.qty - 1;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { ...it, qty: nextQty } };
    });
  };

  const remove = (id: string) => {
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearAll = () => setSelected({});

  const proceedToCheckout = () => {
    if (!canCheckout) return;

    // Add each selected item to cart.
    // IMPORTANT: use composite id so different weights don’t merge.
    for (const it of selectedList) {
      const price = it.product.prices?.[it.weight] ?? 0;

      cart.add(
        {
          id: `${it.product.id}-${it.weight}`, // composite
          name: it.product.name,
          category: it.product.category,
          image: it.product.image,
          weight: it.weight,
          price,
        },
        it.qty
      );
    }

    cart.close();
    router.push("/checkout");
  };

  return (
    <>
      <Navbar />

      <main className="px-6 py-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brown">
              Build Your Custom Order
            </h1>
            <p className="opacity-80 mt-1">
              Minimum total weight: <span className="font-bold">5kg</span>
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full md:w-[320px] px-4 py-2 rounded-full border border-gold bg-cream/60 outline-none"
            />
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
          {/* LEFT: Products */}
          <section>
            {loading ? (
              <div className="premium-card p-6">Loading products…</div>
            ) : filtered.length === 0 ? (
              <div className="premium-card p-6">No products found.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => {
                  const already = !!selected[p.id];
                  const availableWeights: WeightKey[] = (["250g", "500g", "1kg"] as WeightKey[]).filter(
                    (w) => (p.prices?.[w] ?? 0) > 0
                  );

                  const displayWeight = firstAvailableWeight(p);
                  const displayPrice = p.prices?.[displayWeight] ?? 0;

                  return (
                    <div key={p.id} className="premium-card overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-44 object-cover"
                        loading="lazy"
                      />
                      <div className="p-4">
                        <div className="text-xs opacity-70">{p.category}</div>
                        <div className="font-bold text-brown mt-1">{p.name}</div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm font-semibold">
                            ${displayPrice.toFixed(2)}{" "}
                            <span className="opacity-70 font-normal">
                              ({displayWeight})
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2 flex-wrap">
                          {availableWeights.map((w) => (
                            <span
                              key={w}
                              className="text-xs px-2 py-1 rounded-full border border-gold opacity-80"
                            >
                              {w}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={already}
                          onClick={() => addOrUpdate(p)}
                          className={`mt-4 w-full py-2 rounded-lg font-semibold transition
                            ${
                              already
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-green-800 text-white hover:bg-green-900"
                            }`}
                        >
                          {already ? "Added" : "Add to Custom Box"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT: Sticky Summary */}
          <aside className="lg:sticky lg:top-28 h-fit premium-card p-5">
            <div className="flex items-center justify-between">
              <div className="font-bold text-brown text-lg">Your Custom Box</div>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm underline opacity-80 hover:opacity-100"
              >
                Clear
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[360px] overflow-auto pr-1">
              {selectedList.length === 0 ? (
                <div className="opacity-70">No items selected yet.</div>
              ) : (
                selectedList.map((it) => {
                  const p = it.product;
                  const weights: WeightKey[] = (["250g", "500g", "1kg"] as WeightKey[]).filter(
                    (w) => (p.prices?.[w] ?? 0) > 0
                  );

                  const unitPrice = p.prices?.[it.weight] ?? 0;

                  return (
                    <div key={p.id} className="border border-gold/40 rounded-xl p-3 bg-white/60">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs opacity-70">{p.category}</div>
                        </div>
                        <button
                          type="button"
                          className="text-sm opacity-70 hover:opacity-100"
                          onClick={() => remove(p.id)}
                          aria-label="Remove"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <select
                          value={it.weight}
                          onChange={(e) => updateWeight(p.id, e.target.value as WeightKey)}
                          className="px-3 py-2 rounded-lg border border-gold bg-cream/60"
                        >
                          {weights.map((w) => (
                            <option key={w} value={w}>
                              {w} — ${((p.prices?.[w] ?? 0) as number).toFixed(2)}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => dec(p.id)}
                            className="w-9 h-9 rounded-lg border border-gold bg-white font-bold"
                          >
                            −
                          </button>
                          <div className="w-8 text-center font-bold">{it.qty}</div>
                          <button
                            type="button"
                            onClick={() => inc(p.id)}
                            className="w-9 h-9 rounded-lg border border-gold bg-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-sm flex justify-between opacity-90">
                        <span>
                          Weight: {(WEIGHT_TO_KG[it.weight] * it.qty).toFixed(2)}kg
                        </span>
                        <span className="font-semibold">
                          ${(unitPrice * it.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 border-t border-gold/40 pt-4 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Total Weight</span>
                <span>{totalWeightKg.toFixed(2)}kg</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Estimated Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              {!canCheckout && (
                <div className="text-sm text-red-600">
                  Add {(5 - totalWeightKg).toFixed(2)}kg more to continue.
                </div>
              )}

              <button
                type="button"
                disabled={!canCheckout || selectedList.length === 0}
                onClick={proceedToCheckout}
                className={`mt-2 w-full py-3 rounded-xl font-bold transition
                  ${
                    canCheckout && selectedList.length > 0
                      ? "bg-green-800 text-white hover:bg-green-900"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
