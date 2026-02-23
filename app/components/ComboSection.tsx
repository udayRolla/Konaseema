"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      .then((c: any) =>
        setCombos((Array.isArray(c) ? c : []).slice(0, 5))
      )
      .catch(() => setCombos([]));
  }, []);

  if (!combos.length) return null;

  return (
    <section className="px-4 sm:px-6 pt-6 pb-10">
      <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c1f14]">
        Combos &amp; Value Packs
      </h2>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Existing Combo Cards */}
        {combos.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-[#eadfcd] bg-white/70 shadow-sm overflow-hidden"
          >
            <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#2c1f14] leading-snug">
                {c.name}
              </h3>
              <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md bg-[#c9a36a] text-white">
                COMBO
              </span>
            </div>

            <div className="relative aspect-[16/9] bg-[#faf7f2] overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

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

        {/* 🔥 NEW CUSTOM ORDER CARD */}
        <Link href="/custom-order">
          <div className="rounded-2xl border-2 border-dashed border-[#c9a36a] bg-[#faf7f2] shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer">
            
            {/* Title */}
            <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#2c1f14] leading-snug">
                Create Your Own Combo
              </h3>
              <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md bg-green-800 text-white">
                CUSTOM
              </span>
            </div>

            {/* Icon / Visual */}
            <div className="relative aspect-[16/9] bg-[#fff3e3] flex items-center justify-center text-5xl">
              🎁
            </div>

            {/* Description */}
            <div className="px-4 py-4">
              <p className="text-sm text-[#5c4a3c]">
                Select your favorite sweets & snacks.
                <br />
                Minimum order: <span className="font-semibold">5kg</span>
              </p>

              <div className="mt-5 w-full text-center font-semibold text-green-800 border-t border-[#efe4d6] pt-4">
                Start Building &nbsp;&gt;
              </div>
            </div>
          </div>
        </Link>

      </div>
    </section>
  );
}
