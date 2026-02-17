import { supabase } from "./supabaseClient";

export type CartItem = {
  // Keep flexible because some parts of the app use string ids and others use numbers
  id: string | number;
  name: string;
  price: number;
  qty: number;
  image?: string;
  weight?: string;

  // NOTE: We intentionally do NOT persist category into order_items
  // because your Supabase order_items table does not have a `category` column.
};

export type ShippingInput = {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string; // default US
};

export async function createOrderInDb(args: {
  items: CartItem[];
  shipping: ShippingInput;
  currency?: string;
  notes?: string;
}) {
  const { items, shipping, currency = "INR", notes } = args;

  if (!items || items.length === 0) {
    return { ok: false as const, error: "Cart is empty" };
  }

  // Require login (because RLS uses auth.uid())
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) return { ok: false as const, error: userErr.message };
  const user = userData.user;
  if (!user) return { ok: false as const, error: "Please login to place order" };

  // totals
  const subtotal = items.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
  const shippingFee = 0; // adjust later if needed
  const total = subtotal + shippingFee;

  // 1) insert address
  const { data: addressRow, error: addrErr } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      full_name: shipping.full_name,
      email: shipping.email,
      phone: shipping.phone,
      address_line1: shipping.address_line1,
      address_line2: shipping.address_line2 ?? null,
      city: shipping.city,
      state: shipping.state,
      postal_code: shipping.postal_code,
      country: shipping.country ?? "US",
    })
    .select("id")
    .single();

  if (addrErr) return { ok: false as const, error: addrErr.message };

  // 2) insert order
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: addressRow.id,
      currency,
      status: "pending",
      subtotal,
      shipping: shippingFee,
      total,
      notes: notes ?? null,
    })
    .select("id")
    .single();

  if (orderErr) return { ok: false as const, error: orderErr.message };

  // 3) insert items
  // IMPORTANT: Insert ONLY columns that exist in your `order_items` table schema.
  // Your table does NOT have `category`, so we do not include it.
  const payload = items.map((it) => ({
    order_id: orderRow.id,
    product_id: String(it.id),
    name: it.name,
    price: Number(it.price),
    qty: Number(it.qty),
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(payload);
  if (itemsErr) return { ok: false as const, error: itemsErr.message };

  return {
    ok: true as const,
    orderId: orderRow.id as number,
    totals: { subtotal, shipping: shippingFee, total, currency },
  };
}

/**
 * Kept only to avoid breaking imports in existing UI.
 * This is for CONTACT / SUPPORT messaging, NOT for placing orders via WhatsApp.
 */
export function buildWhatsAppOrderMessage(args: {
  orderId: number;
  items: CartItem[];
  shipping: ShippingInput;
  totals: { subtotal: number; shipping: number; total: number; currency: string };
}) {
  const { orderId, shipping } = args;

  const lines: string[] = [];
  lines.push("Hi, I need support.");
  lines.push(`Order ID: ${orderId}`);
  lines.push(`Name: ${shipping.full_name}`);
  lines.push(`Phone: ${shipping.phone}`);

  return lines.join("\n");
}
