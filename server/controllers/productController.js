import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import slugify from 'slugify';

// ─── Public: List products with filter/sort/paginate ──────────────────────
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      gender,
      fragranceFamily,
      edition,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      featured,
      bestseller,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (gender) query.gender = gender;
    if (fragranceFamily) query.fragranceFamily = { $in: fragranceFamily.split(',') };
    if (edition) query.edition = { $in: edition.split(',') };
    if (featured === 'true') query.featured = true;
    if (bestseller === 'true') query.bestseller = true;

    // Price filter on variants
    if (minPrice || maxPrice) {
      query['variants.price'] = {};
      if (minPrice) query['variants.price'].$gte = Number(minPrice);
      if (maxPrice) query['variants.price'].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort === 'price_asc' ? { 'variants.0.price': 1 } : sort === 'price_desc' ? { 'variants.0.price': -1 } : sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Public: Single product by slug ───────────────────────────────────────
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

// ─── Public: Search autocomplete ──────────────────────────────────────────
export const searchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ suggestions: [] });
    const products = await Product.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' }, name: 1, slug: 1, 'images.0': 1 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(6);
    res.json({ suggestions: products });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: Create product ────────────────────────────────────────────────
export const createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    data.slug = slugify(data.name, { lower: true, strict: true });

    // Handle uploaded images
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, { folder: 'zaza-perfumes' })
        )
      );
      data.images = uploads.map((u) => ({ url: u.secure_url, publicId: u.public_id }));
    }

    const product = await Product.create(data);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: Update product ────────────────────────────────────────────────
export const updateProduct = async (req, res, next) => {
  try {
    const data = req.body;
    if (data.name) data.slug = slugify(data.name, { lower: true, strict: true });

    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.upload(file.path, { folder: 'zaza-perfumes' })
        )
      );
      const newImages = uploads.map((u) => ({ url: u.secure_url, publicId: u.public_id }));
      data.images = [...(data.existingImages ? JSON.parse(data.existingImages) : []), ...newImages];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: Delete product ────────────────────────────────────────────────
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete images from Cloudinary
    await Promise.all(
      (product.images || [])
        .filter((img) => img.publicId)
        .map((img) => cloudinary.uploader.destroy(img.publicId))
    );

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: Get all products (includes inactive) ──────────────────────────
export const adminGetProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort('-createdAt')
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ products, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    next(err);
  }
};
