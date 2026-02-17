"use client";

import { useEffect, useState } from "react";
import { getCombosFromSheet } from "../lib/sheetCombos";

type Combo = {
  id: string;
  name: string;
  category?: string;
  image: string;
  price?: number;
  weight?: string;
  is_combo?: boolean;
  items: { name: string; weight: string }[];
};

export default function ComboSection({
  onOpenCombo,
}: {
  onOpenCombo: (combo: Combo) => void;
}) {
  const [combos, setCombos] = useState<Combo[]>([]);

  useEffect(() => {
    getCombosFromSheet()
      .then((c: any) => setCombos((Array.isArray(c) ? c : []).slice(0, 5))) // ✅ show at least 5
      .catch(() => setCombos([]));
  }, []);

  if (!combos.length) return null;

  return (
    <section className="px-4 sm:px-6 pt-6 pb-10">
      <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c1f14]">
        Combos &amp; Value Packs
      </h2>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {combos.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-[#eadfcd] bg-white/70 shadow-sm overflow-hidden"
          >
            {/* Title row */}
            <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#2c1f14] leading-snug">
                {c.name}
              </h3>
              <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md bg-[#c9a36a] text-white">
                COMBO
              </span>
            </div>

            {/* Image */}
            <div className="relative aspect-[16/9] bg-[#faf7f2] overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Items list: ONLY name + weight */}
            <div className="px-4 py-4">
              <ul className="space-y-2 text-sm text-[#5c4a3c]">
                {c.items.slice(0, 6).map((it, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-[2px]">✓</span>
                    <span className="truncate">
                      {it.name} {it.weight ? `– ${it.weight}` : ""}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                onClick={() => onOpenCombo(c)}
                className="mt-5 w-full text-center font-semibold text-[#2f4a3a] border-t border-[#efe4d6] pt-4 hover:underline"
              >
                View Combo &nbsp;&gt;
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
