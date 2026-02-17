"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const cart = useCart();
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  const goToSection = (id: string) => {
    router.push(`/#${id}`);
  };

  const initial = useMemo(() => {
    const src = (user?.email ?? "").trim();
    if (!src) return "U";
    return src[0].toUpperCase();
  }, [user]);

  // Close profile menu on outside click / ESC
  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setMenuOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/90 border-b border-gold">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo -> Home (works on all pages) */}
          <Link
  href="/"
  className="brand-logo text-4xl text-brown font-black tracking-wider"
  aria-label="Go to home"
>
         Konaseema Specials   
          </Link>

          <div className="hidden md:flex gap-8 font-semibold">
            <button className="hover:text-gold" onClick={() => goToSection("home")} type="button">
              Home
            </button>
            <button className="hover:text-gold" onClick={() => goToSection("categories")} type="button">
              Categories
            </button>
            <button className="hover:text-gold" onClick={() => goToSection("products")} type="button">
              Products
            </button>
            <button className="hover:text-gold" onClick={() => goToSection("about")} type="button">
              About
            </button>
            <button className="hover:text-gold" onClick={() => goToSection("contact")} type="button">
              Contact
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* ✅ Login or Profile-letter */}
            {!user ? (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="px-5 py-2 rounded-full border-2 border-blue-600 text-blue-700 font-semibold"
              >
                Login
              </button>
            ) : (
              <div className="relative" ref={menuRef}>
                {/* Profile circle (first letter) */}
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="icon-circle font-bold text-brown"
                  title={user.email ?? "Profile"}
                  aria-label="Open profile menu"
                >
                  {initial}
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-44 premium-card p-2">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f6efe6] font-semibold"
                      onClick={async () => {
                        setMenuOpen(false);
                        await logout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <button className="relative" onClick={cart.open} aria-label="Open cart" type="button">
              <ShoppingCart />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-brown text-xs font-bold rounded-full px-2 py-0.5">
                  {cart.count}
                </span>
              )}
            </button>

            {/* WhatsApp (keep as-is / contact only) */}
            <a
              aria-label="WhatsApp"
              className="icon-circle whatsapp-circle"
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noreferrer"
              title="Contact on WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
