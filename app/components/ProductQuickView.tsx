"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

export type ProductLike = {
  id: string;
  name: string;
  category: string;
  image: string;

  // sheet flags
  out_of_stock?: boolean;
  is_live?: boolean;

  // multi-pack prices
  prices?: {
    "250g"?: number;
    "500g"?: number;
    "1kg"?: number;
  };

  // optional text
  desc?: string;
  highlights?: string[];

  // defaults
  weight?: "250g" | "500g" | "1kg";
  price?: number;

  // ✅ COMBO SUPPORT
  is_combo?: boolean;
  items?: { name: string; weight?: string }[];
};

type Props = {
  product: ProductLike;
  suggestions?: ProductLike[];
  onOpenSuggestion?: (p: ProductLike) => void;
  onClose: () => void;
  onAdd: (payload: any, qty: number) => void;
};

/* =========================================================
   HELPERS
========================================================= */

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(n) ? n : 0);

function fallbackHighlights(p: ProductLike): string[] {
  const cat = (p.category || "").toLowerCase();
  if (cat.includes("podi")) {
    return [
      "Freshly prepared in small batches",
      "Traditional roast & grind process",
      "Airtight packing for freshness",
      "Best with ghee / oil",
    ];
  }
  if (cat.includes("pickle")) {
    return [
      "Authentic homestyle recipe",
      "Made with fresh ingredients",
      "Balanced spice & tang",
      "Store refrigerated after opening",
    ];
  }
  if (cat.includes("snack")) {
    return [
      "Fresh batch for crunch",
      "Traditional spice blend",
      "Airtight packing",
      "Best before: 15–30 days",
    ];
  }
  return [
    "Freshly prepared and packed",
    "Authentic Konaseema taste",
    "Hygienic packing",
    "Store cool & dry",
  ];
}

const WEIGHTS: Array<"250g" | "500g" | "1kg"> = ["250g", "500g", "1kg"];

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductQuickView({
  product,
  suggestions = [],
  onOpenSuggestion,
  onClose,
  onAdd,
}: Props) {
  /* ======================================================
     🔥 COMBO QUICK VIEW
  ====================================================== */
  if (product.is_combo && product.items) {
    useEffect(() => {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, []);

    return (
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/45" onClick={onClose} />

        <div className="absolute inset-0 flex items-end md:items-center md:justify-center">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full md:max-w-3xl bg-[#fffaf2] border border-[#e8dccb]
                       rounded-t-3xl md:rounded-2xl max-h-[92dvh]
                       overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-5 pt-4 pb-4 border-b border-[#efe4d6]">
              <div className="text-[12px] text-[#c9a36a] font-semibold">
                Combo Pack
              </div>

              <h3 className="mt-1 text-2xl font-semibold text-[#2c1f14]">
                {product.name}
              </h3>

              <button
                onClick={onClose}
                className="absolute right-4 top-4 h-10 w-10 rounded-full
                           bg-white/70 border border-[#e8dccb] text-xl"
              >
                ×
              </button>
            </div>

            {/* Image */}
            <div className="h-[240px] bg-[#faf7f2]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="text-sm font-semibold text-[#2c1f14] mb-3">
                Included Items
              </div>

              <ul className="space-y-2 text-sm text-[#5c4a3c]">
                {product.items.map((it, i) => (
                  <li key={i} className="flex gap-2">
                    <span>✓</span>
                    <span>
                      {it.name}
                      {it.weight ? ` – ${it.weight}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add */}
            <div className="border-t border-[#efe4d6] bg-[#fffaf2] px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  onAdd(product, 1);
                  onClose();
                }}
                className="w-full h-12 rounded-2xl font-semibold
                           bg-[#2f4a3a] text-white hover:brightness-110"
              >
                Add Combo to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================
     ✅ NORMAL PRODUCT QUICK VIEW
  ====================================================== */

  const defaultWeight = useMemo<"250g" | "500g" | "1kg">(() => {
    const p = product.prices || {};
    if (product.weight) return product.weight;
    if (p["250g"]) return "250g";
    if (p["500g"]) return "500g";
    if (p["1kg"]) return "1kg";
    return "250g";
  }, [product.weight, product.prices]);

  const [qty, setQty] = useState(1);
  const [weight, setWeight] =
    useState<"250g" | "500g" | "1kg">(defaultWeight);

  useEffect(() => {
    setQty(1);
    setWeight(defaultWeight);
  }, [defaultWeight, product.id]);

  const highlights = useMemo(() => {
    const h = product.highlights?.filter(Boolean) ?? [];
    return h.length >= 4 ? h.slice(0, 4) : fallbackHighlights(product);
  }, [product]);

  const unitPrice = useMemo(() => {
    const p = product.prices || {};
    const val = p[weight];
    if (typeof val === "number" && val > 0) return val;
    return Number(product.price ?? 0);
  }, [product.prices, product.price, weight]);

  const totalPrice = unitPrice * qty;
  const disabled = !!product.out_of_stock || product.is_live === false;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleAdd = () => {
    onAdd(
      {
        ...product,
        weight,
        price: unitPrice,
      },
      qty
    );
    onClose();
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div className="absolute inset-0 flex items-end md:items-center md:justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full md:max-w-4xl bg-[#fffaf2] border border-[#e8dccb] shadow-2xl
                     rounded-t-3xl md:rounded-2xl max-h-[92dvh]
                     overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Grab handle */}
          <div className="md:hidden pt-2 pb-1 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-black/15" />
          </div>

          {/* Header */}
          <div className="relative px-5 pt-3 pb-4 md:px-6 md:pt-6 border-b border-[#efe4d6]">
            <div className="text-[12px] text-[#c9a36a] font-semibold">
              {product.category}
            </div>

            <h3 className="mt-1 text-2xl md:text-3xl font-semibold text-[#2c1f14] pr-12">
              {product.name}
            </h3>

            {product.desc && (
              <p className="mt-2 text-sm text-[#6b5a4a]">{product.desc}</p>
            )}

            <button
              onClick={onClose}
              className="absolute right-4 top-3 md:right-5 md:top-5 h-10 w-10
                         rounded-full bg-white/70 border border-[#e8dccb] text-xl"
            >
              ×
            </button>
          </div>

          {/* Scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="bg-[#faf7f2]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[260px] md:h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="p-5 md:p-7">
                {/* Weight */}
                <div className="text-sm font-semibold text-[#2c1f14]">
                  Select weight
                </div>

                <div className="mt-2 flex gap-2 flex-wrap">
                  {WEIGHTS.map((w) => {
                    const available =
                      (product.prices?.[w] ?? 0) > 0 || !product.prices;
                    return (
                      <button
                        key={w}
                        disabled={!available}
                        onClick={() => setWeight(w)}
                        className={[
                          "px-4 py-2 rounded-full border text-sm",
                          weight === w
                            ? "bg-[#2f4a3a] text-white"
                            : "bg-white",
                          !available && "opacity-40 cursor-not-allowed",
                        ].join(" ")}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>

                {/* Price */}
                <div className="mt-4 text-2xl font-bold text-[#2c1f14]">
                  {usd(unitPrice)}
                  <span className="ml-2 text-sm text-[#6b5a4a]">/ {weight}</span>
                </div>

                {/* Quantity */}
                <div className="mt-6">
                  <div className="text-sm font-semibold mb-2">Quantity</div>
                  <div className="flex items-center border rounded-xl w-fit">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 text-xl"
                    >
                      −
                    </button>
                    <div className="w-10 text-center font-semibold">{qty}</div>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      className="w-10 h-10 text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-6">
                  <div className="text-sm font-semibold mb-2">
                    Product details
                  </div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-10">
                    <div className="text-sm font-semibold mb-3">
                      You may also like
                    </div>
                    <div className="flex gap-3 overflow-x-auto">
                      {suggestions.slice(0, 8).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onOpenSuggestion?.(s)}
                          className="w-[160px] shrink-0 border rounded-xl overflow-hidden"
                        >
                          <img
                            src={s.image}
                            alt={s.name}
                            className="h-[90px] w-full object-cover"
                          />
                          <div className="p-2 text-sm font-semibold truncate">
                            {s.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-24" />
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="border-t bg-[#fffaf2] px-5 py-4 flex justify-between items-center">
            <div className="font-bold">{usd(totalPrice)}</div>
            <button
              disabled={disabled}
              onClick={handleAdd}
              className="h-12 px-6 rounded-2xl font-semibold bg-[#2f4a3a] text-white disabled:bg-gray-300"
            >
              {product.out_of_stock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
