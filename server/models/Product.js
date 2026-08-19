import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true }, // e.g. "30ml", "50ml", "100ml"
  price: { type: Number, required: true },
  compareAtPrice: Number, // original price for showing discount
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, unique: true, sparse: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,
    notes: {
      top: [String],
      heart: [String],
      base: [String],
    },
    gender: {
      type: String,
      enum: ['masculine', 'feminine', 'unisex'],
      required: true,
    },
    fragranceFamily: {
      type: String,
      enum: ['floral', 'woody', 'oriental', 'fresh', 'citrus', 'gourmand', 'aquatic', 'fougere', 'chypre'],
      required: true,
    },
    concentration: {
      type: String,
      enum: ['EDT', 'EDP', 'Parfum', 'EDC', 'Cologne'],
      default: 'EDP',
    },
    edition: {
      type: String,
      enum: ['noir', 'white', 'purple', 'blue', 'gold', 'rose'],
      default: 'noir',
    },
    images: [
      {
        url: String,
        publicId: String,
        alt: String,
      },
    ],
    variants: [variantSchema],
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    tags: [String],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ fragranceFamily: 1, gender: 1, edition: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
