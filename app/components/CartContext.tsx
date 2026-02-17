"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =======================
   PRODUCT TYPE
   (SAFE FOR ALL FILES)
======================= */
export type Product = {
  id: string;
  name: string;

  // ✅ Keep price for Hero.tsx & existing UI
  price?: number;

  // ✅ Future pricing system support
  priceKey?: string;

  weight: string;
  category: string;
  image: string;

  // ✅ Used in QuickView
  highlights?: string[];
};

/* =======================
   CART ITEM TYPE
======================= */
export type CartItem = Product & {
  qty: number;
};

/* =======================
   CONTEXT TYPE
======================= */
type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (p: Product, qty?: number) => void;
  dec: (id: string) => void;
  inc: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

const STORAGE_KEY = "konaseema_cart_v1";

/* =======================
   PROVIDER
======================= */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  /* ---- Load cart ---- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  /* ---- Save cart ---- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  /* ---- Derived values ---- */
  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + i.qty * (i.price ?? 0),
        0
      ),
    [items]
  );

  /* ---- Actions ---- */
  const add = (p: Product, qty: number = 1) => {
    setItems((prev) => {
      const found = prev.find((x) => x.id === p.id);
      if (found) {
        return prev.map((x) =>
          x.id === p.id ? { ...x, qty: x.qty + qty } : x
        );
      }
      return [...prev, { ...p, qty }];
    });
    setIsOpen(true);
  };

  const inc = (id: string) =>
  setItems((prev) =>
    prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x))
  );


  const dec = (id: string) =>
    setItems((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0)
    );

  const remove = (id: string) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  const clear = () => setItems([]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);

  const value: CartCtx = {
    items,
    count,
    total,
    add,
    dec,
    inc,
    remove,
    clear,
    isOpen,
    open,
    close,
    toggle,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/* =======================
   HOOK
======================= */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
