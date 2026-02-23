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
        setCombos(Array.isArray(c) ? c.slice(0, 5) : [])
      )
      .catch(() => setCombos([]));
  }, []);

  return (
    <section className="px-4 sm:px-6 pt-6 pb-10">
      <h2 className="text-3xl sm:text-4xl font-semibold text-[#2c1f14]">
        Combos &amp; Value Packs
      </h2>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* 🔥 CUSTOM ORDER CARD */}
        <Link
          href="/custom-order"
          className="order-first lg:order-last group relative"
        >
          <div className="
            relative
            rounded-2xl
            border-2
            border-dashed
            border-[#c9a36a]
            bg-[#faf7f2]
            overflow-hidden
            transition-all
            duration-300
            group-hover:scale-[1.03]
            group-hover:shadow-2xl
          ">

            {/* Glow Effect */}
            <div className="
              absolute inset-0
              opacity-0
              group-hover:opacity-100
              transition
              duration-500
              pointer-events-none
              bg-gradient-to-r
              from-green-200/30
              via-yellow-100/40
              to-green-200/30
              blur-xl
            " />

            {/* Ribbon */}
            <div className="
              absolute top-4 -right-10
              rotate-45
              bg-green-800
              text-white
              text-xs
              font-bold
              px-10 py-1
              shadow-md
            ">
              BUILD YOUR OWN
            </div>

            {/* Title */}
            <div className="relative px-4 pt-6 pb-3 flex items-start justify-between gap-3 z-10">
              <h3 className="text-lg font-semibold text-[#2c1f14] leading-snug">
                Create Your Own Combo
              </h3>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-green-800 text-white">
                CUSTOM
              </span>
            </div>

            {/* Icon */}
            <div className="relative aspect-[16/9] bg-[#fff3e3] flex items-center justify-center text-5xl z-10">
              🎁
            </div>

            {/* Description */}
            <div className="relative px-4 py-4 z-10">
              <p className="text-sm text-[#5c4a3c]">
                Select your favorite sweets & snacks.
                <br />
                Minimum order: <span className="font-semibold">5kg</span>
              </p>

              <div className="
                mt-5 w-full text-center
                font-semibold text-green-800
                border-t border-[#efe4d6]
                pt-4
                group-hover:text-green-900
              ">
                Start Building →
              </div>
            </div>
          </div>
        </Link>

        {/* Existing Combos */}
        {combos.map((c) => (
          <div
            key={c.id}
            className="
              rounded-2xl
              border border-[#eadfcd]
              bg-white/70
              shadow-sm
              overflow-hidden
              transition-all
              duration-300
              hover:shadow-xl
              hover:-translate-y-1
            "
          >
            <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#2c1f14] leading-snug">
                {c.name}
              </h3>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#c9a36a] text-white">
                COMBO
              </span>
            </div>

            <div className="relative aspect-[16/9] bg-[#faf7f2] overflow-hidden">
              <img
                src={c.image}
                alt={c.name}
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
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
                View Combo →
              </button>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
