/**
 * Barcode Product Lookup Utility
 * ─────────────────────────────
 * Source 1: OpenFoodFacts  → Product Name (best for Indian/food products)
 * Source 2: UPCItemDB      → Price (lowest_recorded_price)
 * Source 3: Local HSN JSON → HSN Code + GST% (keyword matching)
 */

// ─── Local HSN Dataset ────────────────────────────────────────────────────────
const HSN_DATA = [
  { keyword: 'noodle',      hsn: '1902', gst: '12' },
  { keyword: 'pasta',       hsn: '1902', gst: '12' },
  { keyword: 'bread',       hsn: '1905', gst: '5'  },
  { keyword: 'biscuit',     hsn: '1905', gst: '18' },
  { keyword: 'cookie',      hsn: '1905', gst: '18' },
  { keyword: 'cracker',     hsn: '1905', gst: '18' },
  { keyword: 'cake',        hsn: '1905', gst: '18' },
  { keyword: 'cereal',      hsn: '1904', gst: '18' },
  { keyword: 'rice',        hsn: '1006', gst: '5'  },
  { keyword: 'atta',        hsn: '1101', gst: '5'  },
  { keyword: 'flour',       hsn: '1101', gst: '5'  },
  { keyword: 'sugar',       hsn: '1701', gst: '5'  },
  { keyword: 'milk',        hsn: '0401', gst: '0'  },
  { keyword: 'butter',      hsn: '0405', gst: '12' },
  { keyword: 'cheese',      hsn: '0406', gst: '12' },
  { keyword: 'yogurt',      hsn: '0403', gst: '5'  },
  { keyword: 'curd',        hsn: '0403', gst: '5'  },
  { keyword: 'cream',       hsn: '3304', gst: '18' },
  { keyword: 'ghee',        hsn: '0405', gst: '12' },
  { keyword: 'paneer',      hsn: '0406', gst: '5'  },
  { keyword: 'oil',         hsn: '1512', gst: '5'  },
  { keyword: 'chips',       hsn: '2106', gst: '18' },
  { keyword: 'kurkure',     hsn: '2106', gst: '18' },
  { keyword: 'snack',       hsn: '2106', gst: '18' },
  { keyword: 'namkeen',     hsn: '2106', gst: '18' },
  { keyword: 'chocolate',   hsn: '1806', gst: '28' },
  { keyword: 'candy',       hsn: '1704', gst: '18' },
  { keyword: 'toffee',      hsn: '1704', gst: '18' },
  { keyword: 'jam',         hsn: '2007', gst: '12' },
  { keyword: 'spread',      hsn: '2007', gst: '12' },
  { keyword: 'sauce',       hsn: '2103', gst: '12' },
  { keyword: 'ketchup',     hsn: '2103', gst: '12' },
  { keyword: 'juice',       hsn: '2009', gst: '12' },
  { keyword: 'cola',        hsn: '2202', gst: '28' },
  { keyword: 'soda',        hsn: '2202', gst: '28' },
  { keyword: 'water',       hsn: '2201', gst: '18' },
  { keyword: 'tea',         hsn: '0902', gst: '5'  },
  { keyword: 'coffee',      hsn: '0901', gst: '5'  },
  { keyword: 'spice',       hsn: '0910', gst: '5'  },
  { keyword: 'masala',      hsn: '0910', gst: '5'  },
  { keyword: 'soap',        hsn: '3401', gst: '18' },
  { keyword: 'shampoo',     hsn: '3305', gst: '18' },
  { keyword: 'conditioner', hsn: '3305', gst: '18' },
  { keyword: 'toothpaste',  hsn: '3306', gst: '18' },
  { keyword: 'toothbrush',  hsn: '9603', gst: '18' },
  { keyword: 'paste',       hsn: '3306', gst: '18' },
  { keyword: 'deodorant',   hsn: '3307', gst: '18' },
  { keyword: 'perfume',     hsn: '3303', gst: '28' },
  { keyword: 'detergent',   hsn: '3402', gst: '18' },
  { keyword: 'sanitizer',   hsn: '3808', gst: '18' },
  { keyword: 'face wash',   hsn: '3304', gst: '18' },
  { keyword: 'lotion',      hsn: '3304', gst: '18' },
  { keyword: 'moisturizer', hsn: '3304', gst: '18' },
  { keyword: 'sunscreen',   hsn: '3304', gst: '18' },
  { keyword: 'diaper',      hsn: '9619', gst: '12' },
  { keyword: 'pen',         hsn: '9608', gst: '12' },
  { keyword: 'pencil',      hsn: '9609', gst: '12' },
  { keyword: 'notebook',    hsn: '4820', gst: '12' },
  { keyword: 'battery',     hsn: '8506', gst: '28' },
  { keyword: 'bulb',        hsn: '8539', gst: '12' },
  { keyword: 'charger',     hsn: '8504', gst: '18' },
  { keyword: 'cable',       hsn: '8544', gst: '18' },
  { keyword: 'earphone',    hsn: '8518', gst: '18' },
  { keyword: 'headphone',   hsn: '8518', gst: '18' },
  { keyword: 'mobile',      hsn: '8517', gst: '12' },
  { keyword: 'phone',       hsn: '8517', gst: '12' },
  { keyword: 't-shirt',     hsn: '6109', gst: '12' },
  { keyword: 'shirt',       hsn: '6205', gst: '12' },
  { keyword: 'pant',        hsn: '6203', gst: '12' },
  { keyword: 'shoe',        hsn: '6401', gst: '18' },
  { keyword: 'sandal',      hsn: '6402', gst: '18' },
];

/**
 * Match HSN from product name + category text
 * @param {string} text - combined product name + category
 * @returns {{ hsn: string, gst: string }}
 */
export const matchHSN = (text) => {
  const lower = text.toLowerCase();
  const match = HSN_DATA.find(h => lower.includes(h.keyword));
  return match ? { hsn: match.hsn, gst: match.gst } : { hsn: '', gst: '' };
};

/**
 * Get full product details from barcode
 * Combines UPCItemDB (price) + OpenFoodFacts (name) + local HSN
 *
 * @param {string} barcode
 * @returns {{ barcode, name, price, brand, hsn, gst, source }}
 */
export const getProductDetails = async (barcode) => {
  let name = '';
  let price = 0;
  let brand = '';
  let category = '';
  let source = 'manual';

  // ── Source 2: UPCItemDB → price + name ───────────────────────────────────
  try {
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      const title = (item.title || '').trim();
      brand = (item.brand || '').trim();

      // Build name: prepend brand if not already in title
      name = (brand && title && !title.toLowerCase().includes(brand.toLowerCase()))
        ? `${brand} ${title}`
        : (title || brand || '');

      price = item.lowest_recorded_price || item.highest_recorded_price || 0;
      category = (item.category || '').toLowerCase();
      if (name) source = 'upcitemdb';
    }
  } catch (error) {
    console.log('[UPCItemDB] Error:', error.message);
  }

  // ── Source 1: OpenFoodFacts → name fallback + category ───────────────────
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;

      // Use OFF name if UPCItemDB didn't find one
      if (!name) {
        const pName = (
          p.product_name_en || p.product_name ||
          p.abbreviated_product_name ||
          p.generic_name_en || p.generic_name || ''
        ).trim();
        const pBrand = p.brands ? p.brands.split(',')[0].trim() : '';
        if (!brand) brand = pBrand;

        const fullName = (pBrand && pName && !pName.toLowerCase().includes(pBrand.toLowerCase()))
          ? `${pBrand} ${pName}` : (pName || pBrand || '');

        const qty = (p.quantity || p.quantity_imported || '').trim();
        name = qty && fullName ? `${fullName} ${qty}` : fullName;
        if (name) source = 'openfoodfacts';
      }

      // Always enrich category from OFF for better HSN matching
      const offCategory = [
        p.categories || '', p.food_groups || '',
        p.pnns_groups_2 || '', p.product_name || '',
      ].join(' ').toLowerCase();
      category += ' ' + offCategory;
    }
  } catch (error) {
    console.log('[OpenFoodFacts] Error:', error.message);
  }

  // ── Source 3: Local HSN JSON → HSN + GST% ────────────────────────────────
  const { hsn, gst } = matchHSN(name + ' ' + category);

  return {
    barcode,
    name: name || '',
    price: Math.round(price),
    brand,
    hsn,
    gst,       // GST percentage as string e.g. '18'
    source,    // 'upcitemdb' | 'openfoodfacts' | 'manual'
    found: !!name,
  };
};
