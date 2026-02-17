"use client";

import { useMemo, useState } from "react";

const CATEGORIES = [
  "All",
  "Healthy Snacks",
  "Sweets",
  "Snacks",
  "Podis",
  "Oils & Ghee",
  "Veg Pickles",
  "Non-Veg Pickles",
  "Essentials",

];

export default function Categories({
  active,
  setActive,
  searchQuery,
  setSearchQuery,
}: any) {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-6 pt-20 pb-14" id="categories">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <h2 className="text-[36px] font-semibold tracking-tight">
            Shop by Category
          </h2>

          {/* SEARCH */}
          <div className="relative w-full md:w-[320px]">
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpen(true);
              }}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              placeholder="Search products"
              className="w-full px-4 py-2 rounded-full border border-[#e8dccb] focus:outline-none"
            />
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c: string) => (
            <button
              key={c}
              onClick={() => {
                if (active === c) {
                  setActive("All");
                } else {
                  setActive(c);
                }
              }}
              className={`px-5 py-2 rounded-full text-[14px] tracking-wide transition
                ${
                  active === c
                    ? "bg-[#3b2417] text-white"
                    : "border border-[#c9a36a] hover:bg-[#f6efe6]"
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
