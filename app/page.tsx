"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Products from "./components/Products";
import CartDrawer from "./components/CartDrawer";
import { getProductsFromSheet } from "./lib/sheetProducts";

export default function Page() {
  const [active, setActive] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const p = await getProductsFromSheet();
      setProducts(p || []);
    }
    load();
  }, []);

  const special = products[0];

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main>
        <Hero special={special} />

        <Categories
          active={active}
          setActive={setActive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Products
          activeCategory={active}
          searchQuery={searchQuery}
        />

        {/* ===== ABOUT + SHIPPING CARDS ===== */}
        <section
          id="about"
          className="px-6 py-24 bg-[#f6efe6] border-t border-[#e2d2b6]"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* About card */}
            <div className="bg-white border border-[#d6c2a3] rounded-2xl p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h2 className="text-3xl font-semibold mb-4 text-[#3b2417]">
                About Konaseema Foods
              </h2>

              <p className="opacity-80 mb-6 text-[#4a3b2f]">
                We craft authentic Konaseema sweets using traditional recipes
                and pure ingredients. Every batch is prepared hygienically and
                packed carefully to preserve freshness and taste.
              </p>

              <ul className="space-y-2 text-[#4a3b2f]">
                <li>Traditional recipes</li>
                <li>Quality ingredients</li>
                <li>Fresh packing</li>
                <li>Perfect for gifting</li>
              </ul>
            </div>

            {/* Shipping card */}
            <div className="bg-white border border-[#d6c2a3] rounded-2xl p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h2 className="text-3xl font-semibold mb-4 text-[#3b2417]">
                Shipping & Freshness
              </h2>

              <p className="opacity-80 mb-6 text-[#4a3b2f]">
                Orders are confirmed via WhatsApp. We pack sweets carefully
                for safe delivery. For best taste, store in a cool dry place
                and consume within the mentioned shelf life.
              </p>

              <div className="border border-[#d6c2a3] rounded-xl p-4 bg-[#faf6ef]">
                <p className="font-semibold text-[#3b2417]">
                  Need bulk / gift orders?
                </p>
                <p className="text-[#4a3b2f]">
                  Message us on WhatsApp for custom combo boxes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer
          id="contact"
          className="bg-[#efe7db] px-6 py-14 border-t border-[#e2d2b6]"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-[#3b2417]">
                Konaseema Foods
              </h3>
              <p className="text-[#6b5a4a]">
                Authentic traditional sweets & snacks.
                Freshly prepared and packed with care.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-3 text-[#3b2417]">
                Contact
              </h4>
              <div className="space-y-2 text-[#6b5a4a]">
                <p>Email: konaseemafoods@example.com</p>
                <p>WhatsApp: +91 63054 19750</p>
                <p>Instagram: @konaseemafoods</p>
              </div>
            </div>

            {/* Policies */}
            <div>
              <h4 className="font-semibold mb-3 text-[#3b2417]">
                Policies
              </h4>
              <div className="space-y-2 text-[#6b5a4a]">
                <p>Return & Refund Policy</p>
                <p>Delivery Policy</p>
                <p>Privacy Policy</p>
                <p>Terms & Conditions</p>
              </div>
            </div>

            {/* Quick Order */}
            <div>
              <h4 className="font-semibold mb-3 text-[#3b2417]">
                Quick Order
              </h4>
              <p className="text-[#6b5a4a] mb-4">
                Order instantly via WhatsApp.
              </p>

              <a
                href="https://wa.me/916305419750"
                target="_blank"
                className="inline-block px-6 py-3 rounded-xl bg-[#2f4a3a] text-white font-semibold shadow-sm transition hover:brightness-110"
              >
                WhatsApp Now
              </a>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-[#e2d2b6] flex flex-col md:flex-row justify-between items-center text-sm text-[#6b5a4a]">
            <p>© {new Date().getFullYear()} Konaseema Foods. All rights reserved.</p>
            <p className="mt-2 md:mt-0">
              Made with love in Konaseema
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
