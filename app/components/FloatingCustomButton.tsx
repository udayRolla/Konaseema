"use client";

import Link from "next/link";

export default function FloatingCustomButton() {
  return (
    <Link
      href="/custom-order"
      className="fixed bottom-5 right-5 z-50 lg:hidden"
    >
      <div className="
        bg-green-800
        text-white
        px-5 py-3
        rounded-full
        shadow-2xl
        font-semibold
        transition
        duration-300
        hover:bg-green-900
        hover:scale-105
      ">
        🎁 Custom Order
      </div>
    </Link>
  );
}
