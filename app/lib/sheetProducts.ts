export const SHEET_URL =
  "https://opensheet.elk.sh/1VfHHO5eN8xHn8MNtmFWdgAXv7SuIt1Bs71SITE7lc_I/Sheet1";

export type SheetProduct = {
  product_id: string;
  product_name: string;
  category: string;
  description?: string;

  price_250g_usd?: string | number;
  price_500g_usd?: string | number;
  price_1kg_usd?: string | number;

  out_of_stock?: string;
  is_live?: string;

  image_url: string;
};

export type ProductFromSheet = {
  id: string;
  name: string;
  category: string;
  desc?: string;
  image: string;
  out_of_stock: boolean;
  is_live: boolean;

  prices: Partial<Record<"250g" | "500g" | "1kg", number>>;

  weight: "250g" | "500g" | "1kg";
  price: number;
};

const toBool = (v: any) => String(v ?? "").trim().toLowerCase() === "true";

const toNum = (v: any) => {
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// ✅ normalizes keys in case sheet headers have spaces
function cleanRowKeys<T extends Record<string, any>>(row: T): T {
  const out: any = {};
  for (const k of Object.keys(row)) out[String(k).trim()] = row[k];
  return out;
}

export async function getProductsFromSheet(): Promise<ProductFromSheet[]> {
  const res = await fetch(SHEET_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);

  const rawRows = (await res.json()) as any[];
  const rows: SheetProduct[] = rawRows.map(cleanRowKeys);

  return rows.map((r) => {
    const prices: ProductFromSheet["prices"] = {
      "250g": toNum((r as any).price_250g_usd),
      "500g": toNum((r as any).price_500g_usd),
      "1kg": toNum((r as any).price_1kg_usd),
    };

    const defaultWeight: ProductFromSheet["weight"] =
      (prices["250g"] ?? 0) > 0
        ? "250g"
        : (prices["500g"] ?? 0) > 0
        ? "500g"
        : "1kg";

    return {
      id: String((r as any).product_id ?? "").trim(),
      name: String((r as any).product_name ?? "").trim(),
      category: String((r as any).category ?? "").trim(),
      desc: (r as any).description ? String((r as any).description).trim() : "",
      image: String((r as any).image_url ?? "").trim(),

      out_of_stock: toBool((r as any).out_of_stock),
      is_live: toBool((r as any).is_live ?? "true"),

      prices,
      weight: defaultWeight,
      price: prices[defaultWeight] ?? 0,
    };
  });
}
