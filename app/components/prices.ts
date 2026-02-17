/** // app/components/prices.ts

export type PackSize =
  | "250g"
  | "500g"
  | "1kg"
  | "200g"
  | "1L"
  | "500ml"
  | "Assorted";

export type PriceTable = Partial<Record<PackSize, number>>;

/**
 * One place to update prices.
 * Keys MUST match product ids in data.ts (p1..p98).
 
export const PRICE_BY_ID: Record<string, PriceTable> = {
  // ---------------- SWEETS ----------------
  p1: { "250g": 145, "500g": 290, "1kg": 580 }, // Kova
  p2: { "250g": 70, "500g": 140, "1kg": 280 }, // Bellam Laddu (Nuvvu/Rava)
  p3: { "250g": 90, "500g": 175, "1kg": 350 }, // Dry Kajjikayalu
  p4: { "250g": 70, "500g": 140, "1kg": 280 }, // Rava Laddu
  p5: { "250g": 150, "500g": 300, "1kg": 600 }, // Minapa Sunnundalu
  p6: { "250g": 115, "500g": 225, "1kg": 450 }, // Kakinada Kaja (Madatha)
  p7: { "250g": 175, "500g": 350, "1kg": 700 }, // Pootharekulu
  p8: { "250g": 150, "500g": 300, "1kg": 600 }, // Arisallu / Nuvvula Arisallu
  p9: { "250g": 75, "500g": 150, "1kg": 300 }, // Boondi Laddu
  p10: { "250g": 125, "500g": 250, "1kg": 500 }, // Thakudhu Laddu
  p11: { "250g": 125, "500g": 250, "1kg": 500 }, // Kobbari Undha (using Kobbari Arisallu price)
  p12: { "250g": 175, "500g": 350, "1kg": 700 }, // Pootharekulu (Palm sugar type) (using Pootharekulu price)
  p13: { "250g": 125, "500g": 250, "1kg": 500 }, // Kobbari Arisallu
  p14: { "250g": 325, "500g": 650, "1kg": 1300 }, // Dry Fruit Laddu
  p15: { "250g": 125, "500g": 250, "1kg": 500 }, // Halwa
  p16: { "250g": 100, "500g": 200, "1kg": 400 }, // Bellam Gavvalu
  p17: { "250g": 100, "500g": 200, "1kg": 400 }, // Bellam Kommulu
  p18: { "250g": 175, "500g": 350, "1kg": 700 }, // Ragi Bellam Laddu
  p19: { "250g": 175, "500g": 350, "1kg": 700 }, // Nuvvula Laddu
  p20: { "250g": 90, "500g": 175, "1kg": 350 }, // Panirulu (using Paanilu)
  p21: { "250g": 70, "500g": 135, "1kg": 270 }, // Gormithilu
  p22: { "250g": 75, "500g": 150, "1kg": 300 }, // Pongadalu
  p23: { "250g": 145, "500g": 290, "1kg": 580 }, // Chalimidi (no table; using Kova price as placeholder)

  // ---------------- SNACKS ----------------
  p24: { "250g": 90, "500g": 175, "1kg": 350 }, // Chekkalu
  p25: { "250g": 90, "500g": 175, "1kg": 350 }, // Murukulu
  p26: { "250g": 90, "500g": 175, "1kg": 350 }, // Chekodhi
  p27: { "250g": 100, "500g": 200, "1kg": 400 }, // Ribbon Pakodi
  p28: { "250g": 85, "500g": 170, "1kg": 340 }, // Karam Boondi
  p29: { "250g": 150, "500g": 300, "1kg": 600 }, // Ganapathi Special Mixture
  p30: { "250g": 150, "500g": 300, "1kg": 600 }, // Karam Jantikalu
  p31: { "250g": 140, "500g": 275, "1kg": 550 }, // Kommulu
  p32: { "250g": 115, "500g": 225, "1kg": 450 }, // Garlic Murukulu
  p33: { "250g": 90, "500g": 175, "1kg": 350 }, // Masala Biscuits (mapped to Masala Pusa)
  p34: { "250g": 125, "500g": 250, "1kg": 500 }, // Special Mixture
  p35: { "250g": 90, "500g": 175, "1kg": 350 }, // Chitti Appadalu
  p36: { "250g": 125, "500g": 250, "1kg": 500 }, // Nagaram Garajilu (mapped)
  p37: { "250g": 75, "500g": 150, "1kg": 300 }, // Nagaram Kastha (mapped)
  p38: { "250g": 150, "500g": 300, "1kg": 600 }, // Mamidi Thondri
  p39: { "250g": 150, "500g": 300, "1kg": 600 }, // Thati Chapa
  p40: { "250g": 75, "500g": 150, "1kg": 300 }, // Bellam Jeedilu
  p41: { "250g": 90, "500g": 175, "1kg": 350 }, // Nuvvula Jeedilu
  p42: { "250g": 70, "500g": 140, "1kg": 280 }, // Chinna Boondi Aachu
  p43: { "250g": 225, "500g": 450, "1kg": 900 }, // Jeedi Pappu Aachu
  p44: { "250g": 100, "500g": 200, "1kg": 400 }, // Pallila Aachu
  p45: { "250g": 275, "500g": 550, "1kg": 1100, "200g": 275 }, // Masala Cashew (200g uses same as 250g for now)
  p46: { "250g": 275, "500g": 550, "1kg": 1100, "200g": 275 }, // Pepper Cashew (same bucket)
  p47: { "250g": 90, "500g": 175, "1kg": 350 }, // Masala Batani
  p48: { "250g": 90, "500g": 175, "1kg": 350 }, // Onion Chekodhi
  p49: { "250g": 115, "500g": 225, "1kg": 450 }, // Gulabi Jantikalu
  p50: { "250g": 90, "500g": 175, "1kg": 350 }, // Ringulu

  // ---------------- HEALTHY SNACKS ----------------
  p51: { "250g": 115, "500g": 225, "1kg": 450 }, // Ragi Ringulu
  p52: { "250g": 115, "500g": 225, "1kg": 450 }, // Ragi Jantikalu
  p53: { "250g": 115, "500g": 225, "1kg": 450 }, // Ragi Chekkalu
  p54: { "250g": 115, "500g": 225, "1kg": 450 }, // Beetroot Jantikalu
  p55: { "250g": 115, "500g": 225, "1kg": 450 }, // Beetroot Chekkalu

  // ---------------- PODIS ----------------
  // Your data uses 200g for podis; your table is for 250g.
  // For now: set 200g = 250g price, so UI shows a price.
  p56: { "250g": 225, "500g": 450, "1kg": 900, "200g": 225 }, // Karvepaku Podi
  p57: { "250g": 275, "500g": 550, "1kg": 1100, "200g": 275 }, // Mulaga Podi
  p58: { "250g": 175, "500g": 350, "1kg": 700, "200g": 175 }, // Karam Podi
  p59: { "250g": 250, "500g": 500, "1kg": 1000, "200g": 250 }, // Velluli Karvepaku Podi
  p60: { "250g": 200, "500g": 400, "1kg": 800, "200g": 200 }, // Sonti Podi
  p61: { "250g": 225, "500g": 450, "1kg": 900, "200g": 225 }, // Kandi Podi
  p62: { "250g": 250, "500g": 500, "1kg": 1000, "200g": 250 }, // Usiri Podi
  p63: { "250g": 225, "500g": 450, "1kg": 900, "200g": 225 }, // Nuvvula Karam Podi
  p64: { "250g": 165, "500g": 330, "1kg": 660, "200g": 165 }, // Daniyalu Podi
  p65: { "250g": 0, "500g": 0, "1kg": 0, "200g": 0 }, // Tilakota Podi (not in your price table)
  p66: { "250g": 250, "500g": 500, "1kg": 1000, "200g": 250 }, // Avise Podi
  p67: { "250g": 200, "500g": 400, "1kg": 800, "200g": 200 }, // Kakara Podi
  p68: { "250g": 100, "500g": 200, "1kg": 400, "200g": 100 }, // Nuvvula Podi
  p69: { "250g": 275, "500g": 550, "1kg": 1100, "200g": 275 }, // Miriyala Podi

  // ---------------- OILS & GHEE ----------------
  // Table provided as 250g/500g/1kg, but your products are 1L / 500ml.
  // We store explicit keys for those.
  p70: { "1L": 480, "500ml": 240 }, // Nuvvula Nune
  p71: { "1L": 600, "500ml": 300 }, // Kobbari Nune
  p72: { "1L": 450, "500ml": 225 }, // Groundnut Oil
  p73: { "500ml": 550, "1kg": 1100 }, // Cow Ghee
  p74: { "500ml": 450, "1kg": 900 }, // Buffalo Ghee

  // ---------------- VEG PICKLES ----------------
  p75: { "250g": 200, "500g": 400, "1kg": 800 }, // Gongura
  p76: { "250g": 200, "500g": 400, "1kg": 800 }, // Avakaya
  p77: { "250g": 200, "500g": 400, "1kg": 800 }, // Mixed Pickle (not in table; using Avakaya)
  p78: { "250g": 190, "500g": 375, "1kg": 750 }, // Magaya
  p79: { "250g": 225, "500g": 450, "1kg": 900 }, // Allam
  p80: { "250g": 200, "500g": 400, "1kg": 800 }, // Tomato
  p81: { "250g": 200, "500g": 400, "1kg": 800 }, // Usirikaya
  p82: { "250g": 225, "500g": 450, "1kg": 900 }, // Chinthakaya
  p83: { "250g": 150, "500g": 300, "1kg": 600 }, // Cauliflower
  p84: { "250g": 200, "500g": 400, "1kg": 800 }, // Lemon
  p85: { "250g": 200, "500g": 400, "1kg": 800 }, // Kothimeera
  p86: { "250g": 200, "500g": 400, "1kg": 800 }, // Karvepaku
  p87: { "250g": 175, "500g": 350, "1kg": 700 }, // Dosakaya
  p88: { "250g": 200, "500g": 400, "1kg": 800 }, // Mulakkaya Pachadi

  // ---------------- NON-VEG PICKLES ----------------
  p89: { "250g": 325, "500g": 650, "1kg": 1300 }, // Chicken
  p90: { "250g": 375, "500g": 750, "1kg": 1500 }, // Gongura Chicken
  p91: { "250g": 400, "500g": 800, "1kg": 1600 }, // Mutton
  p92: { "250g": 475, "500g": 950, "1kg": 1900 }, // Gongura Mutton
  p93: { "250g": 400, "500g": 800, "1kg": 1600 }, // Prawns
  p94: { "250g": 475, "500g": 950, "1kg": 1900 }, // Gongura Prawns
  p95: { "250g": 0, "500g": 0, "1kg": 0 }, // Crab (not in your table)

  // ---------------- GIFT BOXES ----------------
  p96: { Assorted: 0 },
  p97: { Assorted: 0 },
  p98: { Assorted: 0 },
};
*/
