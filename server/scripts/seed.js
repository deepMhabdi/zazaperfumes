import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

// ─── Placeholder Perfume Images (Unsplash CDN — public) ───────────────────
const IMAGES = {
  noir: [
    { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'ZAZA Noir bottle' },
    { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80', alt: 'ZAZA Noir close-up' },
  ],
  white: [
    { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80', alt: 'ZAZA White bottle' },
    { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', alt: 'ZAZA White side' },
  ],
  purple: [
    { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80', alt: 'ZAZA Purple bottle' },
    { url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80', alt: 'ZAZA Purple detail' },
  ],
  blue: [
    { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', alt: 'ZAZA Blue bottle' },
    { url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80', alt: 'ZAZA Blue detail' },
  ],
  gold: [
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', alt: 'ZAZA Gold bottle' },
    { url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80', alt: 'ZAZA Gold close-up' },
  ],
  rose: [
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', alt: 'ZAZA Rose bottle' },
    { url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&q=80', alt: 'ZAZA Rose detail' },
  ],
};

const makeVariants = (base30, base50, base100) => [
  { size: '30ml', price: base30, compareAtPrice: Math.round(base30 * 1.15), stock: 25, sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}-30` },
  { size: '50ml', price: base50, compareAtPrice: Math.round(base50 * 1.15), stock: 40, sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}-50` },
  { size: '100ml', price: base100, compareAtPrice: Math.round(base100 * 1.15), stock: 20, sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}-100` },
];

const products = [
  {
    name: 'ZAZA Noir Absolu',
    slug: 'zaza-noir-absolu',
    description: 'A commanding oriental fragrance that opens with smoky oud and saffron, deepening into a velvety heart of black rose and amber. The drydown reveals a complex base of sandalwood and musk that lingers with magnetic intensity. Noir Absolu is for those who command attention without saying a word.',
    shortDescription: 'Smoky oud, black rose, and amber — power in a bottle.',
    notes: { top: ['Saffron', 'Cardamom', 'Pink Pepper'], heart: ['Black Rose', 'Oud', 'Jasmine Absolute'], base: ['Amber', 'Sandalwood', 'Dark Musk', 'Vanilla'] },
    gender: 'unisex', fragranceFamily: 'oriental', concentration: 'EDP', edition: 'noir',
    images: IMAGES.noir, variants: makeVariants(3200, 5400, 8900),
    featured: true, bestseller: true, tags: ['oud', 'amber', 'smoky', 'luxury'],
    averageRating: 4.8, reviewCount: 124,
  },
  {
    name: 'ZAZA Blanche Lumière',
    slug: 'zaza-blanche-lumiere',
    description: 'A luminous white floral that captures the essence of sunlight through sheer curtains. Fresh aldehydes open onto a pristine heart of white tuberose, lily of the valley, and orris. The base of white musks and cedarwood gives it an airy, clean permanence.',
    shortDescription: 'White tuberose and aldehyde radiance — effortlessly elegant.',
    notes: { top: ['Aldehydes', 'White Peach', 'Bergamot'], heart: ['Tuberose', 'Lily of the Valley', 'Orris', 'Jasmine'], base: ['White Musk', 'Cedarwood', 'Sandalwood'] },
    gender: 'feminine', fragranceFamily: 'floral', concentration: 'EDP', edition: 'white',
    images: IMAGES.white, variants: makeVariants(2800, 4600, 7800),
    featured: true, bestseller: false, tags: ['floral', 'white', 'fresh', 'elegant'],
    averageRating: 4.6, reviewCount: 89,
  },
  {
    name: 'ZAZA Violet Mystère',
    slug: 'zaza-violet-mystere',
    description: 'Seductive and enigmatic, Violet Mystère opens with sparkling violet leaf and iris before revealing a rich heart of heliotrope and violet absolute. Tonka bean and dark benzoin give the drydown an almost edible warmth.',
    shortDescription: 'Violet, iris, and dark tonka — mysterious femininity.',
    notes: { top: ['Violet Leaf', 'Iris', 'Bergamot'], heart: ['Violet Absolute', 'Heliotrope', 'Peony'], base: ['Tonka Bean', 'Benzoin', 'Vetiver', 'White Musk'] },
    gender: 'feminine', fragranceFamily: 'floral', concentration: 'EDP', edition: 'purple',
    images: IMAGES.purple, variants: makeVariants(2600, 4200, 6800),
    featured: false, bestseller: true, tags: ['violet', 'iris', 'sweet', 'purple'],
    averageRating: 4.7, reviewCount: 67,
  },
  {
    name: 'ZAZA Azur Profond',
    slug: 'zaza-azur-profond',
    description: 'A deep oceanic fragrance with the Mediterranean at its core. Marine accord and grapefruit sparkle before a heart of lavender and clary sage — a sophisticated take on aquatic masculinity. Driftwood and ambergris ground the whole composition.',
    shortDescription: 'Ocean depths meet lavender fields — masculine and fresh.',
    notes: { top: ['Marine Accord', 'Grapefruit', 'Lemon'], heart: ['Lavender', 'Clary Sage', 'Geranium'], base: ['Driftwood', 'Ambergris', 'Oakmoss'] },
    gender: 'masculine', fragranceFamily: 'aquatic', concentration: 'EDT', edition: 'blue',
    images: IMAGES.blue, variants: makeVariants(2200, 3800, 5900),
    featured: false, bestseller: true, tags: ['aquatic', 'fresh', 'marine', 'lavender'],
    averageRating: 4.5, reviewCount: 102,
  },
  {
    name: 'ZAZA Or Impérial',
    slug: 'zaza-or-imperial',
    description: 'The crown jewel of the ZAZA collection. Rare Bulgarian rose absolute meets precious agarwood in a fragrance of extraordinary complexity. Saffron-infused benzoin and a touch of gold tobacco leaf add warmth that evolves magnificently over hours.',
    shortDescription: 'Rose absolute, agarwood, and saffron — the pinnacle of luxury.',
    notes: { top: ['Saffron', 'Mandarin', 'Pink Pepper'], heart: ['Bulgarian Rose Absolute', 'Agarwood', 'Gold Tobacco'], base: ['Benzoin', 'Patchouli', 'Amber', 'Civet'] },
    gender: 'unisex', fragranceFamily: 'oriental', concentration: 'Parfum', edition: 'gold',
    images: IMAGES.gold, variants: makeVariants(5800, 9200, 14500),
    featured: true, bestseller: true, tags: ['rose', 'oud', 'gold', 'luxury', 'rare'],
    averageRating: 4.9, reviewCount: 43,
  },
  {
    name: 'ZAZA Rose Séraphique',
    slug: 'zaza-rose-seraphique',
    description: 'A romantic, enveloping rose centered on the Queen of roses — the Damascus rose. Light raspberry and lychee open onto a lush heart that blends three rose varieties. Musk and ambrette seed give the drydown a soft, skin-like quality.',
    shortDescription: 'Three-rose heart, raspberry, and ambrette — romantically pure.',
    notes: { top: ['Raspberry', 'Lychee', 'Peach'], heart: ['Damascus Rose', 'Centifolia Rose', 'Turkish Rose', 'Peony'], base: ['Ambrette', 'White Musk', 'Amberwood'] },
    gender: 'feminine', fragranceFamily: 'floral', concentration: 'EDP', edition: 'rose',
    images: IMAGES.rose, variants: makeVariants(3000, 4900, 7600),
    featured: true, bestseller: false, tags: ['rose', 'romantic', 'floral', 'pink'],
    averageRating: 4.7, reviewCount: 78,
  },
  {
    name: 'ZAZA Cedarwood Oath',
    slug: 'zaza-cedarwood-oath',
    description: 'A bold woody fougère built around Atlas cedarwood and smoked vetiver. Bergamot and black pepper open cleanly before a masculine heart of leather and labdanum. Warm, confident, and enduring — for the modern gentleman.',
    shortDescription: 'Atlas cedar, smoked vetiver, and leather — pure masculine authority.',
    notes: { top: ['Bergamot', 'Black Pepper', 'Grapefruit'], heart: ['Atlas Cedarwood', 'Leather', 'Labdanum'], base: ['Smoked Vetiver', 'Patchouli', 'Oakmoss'] },
    gender: 'masculine', fragranceFamily: 'woody', concentration: 'EDP', edition: 'noir',
    images: IMAGES.noir, variants: makeVariants(2400, 4100, 6600),
    featured: false, bestseller: false, tags: ['woody', 'cedar', 'leather', 'vetiver'],
    averageRating: 4.4, reviewCount: 55,
  },
  {
    name: 'ZAZA Jasmin Étoile',
    slug: 'zaza-jasmin-etoile',
    description: 'Jasmine in its purest expression — a soliflore that celebrates the flower at every stage of its life. Dewy green notes evoke the plant by morning; warm indolic jasmine absolute blooms through the day; musks and sandalwood carry it into evening.',
    shortDescription: 'Pure jasmine absolute from opening to drydown.',
    notes: { top: ['Green Leaves', 'Bergamot', 'Neroli'], heart: ['Jasmine Absolute', 'Jasmine Sambac', 'Ylang-Ylang'], base: ['Sandalwood', 'White Musk', 'Benzoin'] },
    gender: 'feminine', fragranceFamily: 'floral', concentration: 'EDP', edition: 'white',
    images: IMAGES.white, variants: makeVariants(2700, 4400, 7200),
    featured: false, bestseller: false, tags: ['jasmine', 'floral', 'white', 'soliflore'],
    averageRating: 4.6, reviewCount: 38,
  },
  {
    name: 'ZAZA Santal Nocturne',
    slug: 'zaza-santal-nocturne',
    description: 'A meditative sandalwood composition that bridges East and West. Mysore sandalwood (sustainable) is the star, surrounded by creamy coconut, warm hay, and a trace of incense. This is evening comfort at its finest.',
    shortDescription: 'Mysore sandalwood, coconut cream, and incense — meditative warmth.',
    notes: { top: ['Coconut Milk', 'Cardamom', 'Bergamot'], heart: ['Mysore Sandalwood', 'Hay Absolute', 'Incense'], base: ['Benzoin', 'Amber', 'Tonka Bean'] },
    gender: 'unisex', fragranceFamily: 'woody', concentration: 'EDP', edition: 'gold',
    images: IMAGES.gold, variants: makeVariants(3400, 5600, 8800),
    featured: false, bestseller: true, tags: ['sandalwood', 'creamy', 'warm', 'incense'],
    averageRating: 4.8, reviewCount: 61,
  },
  {
    name: 'ZAZA Citrus Éclat',
    slug: 'zaza-citrus-eclat',
    description: 'An electric citrus fragrance built for sunlit mornings. Sicilian bergamot, yuzu, and blood orange explode in the opening while neroli and green tea provide a sophisticated heart. Light musks and ambrette ensure longevity without heaviness.',
    shortDescription: 'Sicilian bergamot, yuzu, and neroli — morning sunshine.',
    notes: { top: ['Sicilian Bergamot', 'Yuzu', 'Blood Orange'], heart: ['Neroli', 'Green Tea', 'White Lily'], base: ['Ambrette', 'White Musk', 'Vetiver'] },
    gender: 'unisex', fragranceFamily: 'citrus', concentration: 'EDT', edition: 'white',
    images: IMAGES.white, variants: makeVariants(1900, 3200, 5200),
    featured: false, bestseller: false, tags: ['citrus', 'fresh', 'bright', 'morning'],
    averageRating: 4.3, reviewCount: 92,
  },
  {
    name: 'ZAZA Patchouli Noir',
    slug: 'zaza-patchouli-noir',
    description: 'Dark, earthy patchouli elevated by dark chocolate and espresso in a gourmand oriental that manages to feel sophisticated, not sweet. Vetiver and birch tar in the base give it an urban edge.',
    shortDescription: 'Dark patchouli, espresso, and birch tar — urban mystique.',
    notes: { top: ['Espresso', 'Dark Chocolate', 'Black Pepper'], heart: ['Patchouli', 'Labdanum', 'Oud'], base: ['Vetiver', 'Birch Tar', 'Dark Amber'] },
    gender: 'masculine', fragranceFamily: 'gourmand', concentration: 'EDP', edition: 'noir',
    images: IMAGES.noir, variants: makeVariants(2500, 4300, 6900),
    featured: false, bestseller: false, tags: ['patchouli', 'dark', 'gourmand', 'espresso'],
    averageRating: 4.5, reviewCount: 47,
  },
  {
    name: 'ZAZA Iris Caché',
    slug: 'zaza-iris-cache',
    description: 'An iris-forward fragrance of rare sophistication. Orris butter absolute forms the backbone while violet leaf and powdery mimosa add texture. The drydown of warm woods and musks transforms it throughout the day.',
    shortDescription: 'Orris butter absolute with violet leaf and mimosa — rarified sophistication.',
    notes: { top: ['Violet Leaf', 'Bergamot', 'Aldehydes'], heart: ['Orris Butter', 'Mimosa', 'Iris Absolute'], base: ['Vetiver', 'Cedarwood', 'Cashmere Musk'] },
    gender: 'feminine', fragranceFamily: 'floral', concentration: 'Parfum', edition: 'purple',
    images: IMAGES.purple, variants: makeVariants(4200, 6800, 10500),
    featured: true, bestseller: false, tags: ['iris', 'orris', 'powdery', 'sophisticated'],
    averageRating: 4.7, reviewCount: 29,
  },
  {
    name: 'ZAZA Oud Royale',
    slug: 'zaza-oud-royale',
    description: 'Pure Cambodian oud wood takes center stage in this unapologetically bold fragrance. Rose de Mai and saffron open the composition before giving way to a dominant oud heart supported by cistus and labdanum. A fragrance for connoisseurs.',
    shortDescription: 'Cambodian oud, saffron, and rose — for the connoisseur.',
    notes: { top: ['Saffron', 'Rose de Mai', 'Elemi'], heart: ['Cambodian Oud', 'Cistus', 'Labdanum'], base: ['Ambergris', 'Sandalwood', 'Dark Musk'] },
    gender: 'masculine', fragranceFamily: 'oriental', concentration: 'Parfum', edition: 'gold',
    images: IMAGES.gold, variants: makeVariants(6500, 10800, 17000),
    featured: true, bestseller: true, tags: ['oud', 'saffron', 'rose', 'luxury', 'connoisseur'],
    averageRating: 4.9, reviewCount: 35,
  },
  {
    name: 'ZAZA Chypre Élégant',
    slug: 'zaza-chypre-elegant',
    description: 'A classic chypre reinterpreted for the modern era. Bergamot and petitgrain open over a mossy, oakmoss-heavy heart — a reference to the golden age of perfumery. Patchouli and labdanum close the composition with earthy refinement.',
    shortDescription: 'Bergamot, oakmoss, and labdanum — a classic chypre reborn.',
    notes: { top: ['Bergamot', 'Petitgrain', 'Lemon'], heart: ['Oakmoss', 'Rose', 'Jasmine'], base: ['Labdanum', 'Patchouli', 'Civet', 'Cedarwood'] },
    gender: 'unisex', fragranceFamily: 'chypre', concentration: 'EDP', edition: 'noir',
    images: IMAGES.noir, variants: makeVariants(3100, 5200, 8200),
    featured: false, bestseller: false, tags: ['chypre', 'oakmoss', 'classic', 'sophisticated'],
    averageRating: 4.6, reviewCount: 44,
  },
  {
    name: 'ZAZA Aqua Infinité',
    slug: 'zaza-aqua-infinite',
    description: 'A modern aquatic that transcends its genre. Instead of synthetic marine notes, ZAZA uses sea salt absolute, ambrette, and a proprietary aqueous accord to create water as it smells in nature. Driftwood and white ambergris ground the whole.',
    shortDescription: 'Sea salt, ambrette, and white ambergris — nature\'s ocean.',
    notes: { top: ['Sea Salt', 'Aqueous Accord', 'Petitgrain'], heart: ['Ambrette', 'Water Lily', 'Cyclamen'], base: ['Driftwood', 'White Ambergris', 'Musks'] },
    gender: 'masculine', fragranceFamily: 'aquatic', concentration: 'EDT', edition: 'blue',
    images: IMAGES.blue, variants: makeVariants(2100, 3600, 5800),
    featured: false, bestseller: false, tags: ['aquatic', 'sea salt', 'fresh', 'natural'],
    averageRating: 4.4, reviewCount: 58,
  },
  {
    name: 'ZAZA Fougère Sauvage',
    slug: 'zaza-fougere-sauvage',
    description: 'A wild, untamed fougère for the man who charts his own course. Lavender and geranium open briskly before coumarin-rich hay and tobacco leaf create a heart of unusual warmth. Oakmoss and castoreum give the drydown its raw character.',
    shortDescription: 'Wild lavender, tobacco hay, and oakmoss — untamed masculine.',
    notes: { top: ['Lavender', 'Bergamot', 'Geranium'], heart: ['Hay Absolute', 'Coumarin', 'Tobacco Leaf'], base: ['Oakmoss', 'Castoreum', 'Vetiver'] },
    gender: 'masculine', fragranceFamily: 'fougere', concentration: 'EDP', edition: 'noir',
    images: IMAGES.noir, variants: makeVariants(2300, 3900, 6300),
    featured: false, bestseller: false, tags: ['fougere', 'lavender', 'tobacco', 'masculine'],
    averageRating: 4.5, reviewCount: 66,
  },
  {
    name: 'ZAZA Vanille Sacrée',
    slug: 'zaza-vanille-sacree',
    description: 'A warm, indulgent vanilla that avoids sweetness through careful balancing. Bourbon vanilla absolute is lifted by rum and dark plum in the opening, balanced by sandalwood and a touch of birch tar that keeps it from veering into dessert territory.',
    shortDescription: 'Bourbon vanilla, rum, and sandalwood — warmly indulgent.',
    notes: { top: ['Dark Plum', 'Rum', 'Mandarin'], heart: ['Bourbon Vanilla Absolute', 'Benzoin', 'Heliotrope'], base: ['Sandalwood', 'Birch Tar', 'Musks'] },
    gender: 'feminine', fragranceFamily: 'oriental', concentration: 'EDP', edition: 'gold',
    images: IMAGES.gold, variants: makeVariants(2900, 4700, 7500),
    featured: false, bestseller: true, tags: ['vanilla', 'warm', 'oriental', 'indulgent'],
    averageRating: 4.8, reviewCount: 88,
  },
  {
    name: 'ZAZA Vert Sauvage',
    slug: 'zaza-vert-sauvage',
    description: 'A sharp, green aromatic inspired by the moment after rain in a pine forest. Tomato leaf and galbanum open with an almost raw vegetality before giving way to a heart of artemisia and violet leaf. Cedarwood, pine resin, and soil base notes ground the composition.',
    shortDescription: 'Tomato leaf, galbanum, and pine resin — green and alive.',
    notes: { top: ['Tomato Leaf', 'Galbanum', 'Black Pepper'], heart: ['Artemisia', 'Violet Leaf', 'Clary Sage'], base: ['Cedarwood', 'Pine Resin', 'Soil Accord', 'Vetiver'] },
    gender: 'unisex', fragranceFamily: 'fresh', concentration: 'EDT', edition: 'white',
    images: IMAGES.white, variants: makeVariants(2000, 3400, 5500),
    featured: false, bestseller: false, tags: ['green', 'fresh', 'aromatic', 'natural'],
    averageRating: 4.3, reviewCount: 31,
  },
];

const coupons = [
  {
    code: 'WELCOME20',
    type: 'percent',
    value: 20,
    minOrderAmount: 2000,
    maxDiscount: 1500,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    usageLimit: 1000,
    active: true,
  },
  {
    code: 'ZAZA500',
    type: 'flat',
    value: 500,
    minOrderAmount: 3000,
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    usageLimit: 500,
    active: true,
  },
  {
    code: 'LUXURY10',
    type: 'percent',
    value: 10,
    minOrderAmount: 5000,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    active: true,
  },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'ZAZA Admin',
      email: process.env.ADMIN_EMAIL || 'admin@zazaperfumes.com',
      passwordHash: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role: 'admin',
      authProvider: 'local',
    });
    console.log(`   ✅ Admin: ${adminUser.email}`);

    console.log('👤 Creating test customer...');
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      passwordHash: 'Test@1234',
      role: 'customer',
      authProvider: 'local',
    });
    console.log(`   ✅ Customer: ${customer.email}`);

    console.log('🌸 Seeding products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`   ✅ ${createdProducts.length} products seeded`);

    console.log('🏷️  Seeding coupons...');
    const createdCoupons = await Coupon.insertMany(coupons);
    console.log(`   ✅ ${createdCoupons.length} coupons seeded`);

    console.log('\n✨ ZAZA Perfumes database seeded successfully!');
    console.log('─────────────────────────────────────────────');
    console.log(`Admin login: ${adminUser.email} / ${process.env.ADMIN_PASSWORD || 'Admin@1234'}`);
    console.log(`Test login:  customer@test.com / Test@1234`);
    console.log(`Coupons:     WELCOME20, ZAZA500, LUXURY10`);
    console.log('─────────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
