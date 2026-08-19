import express from 'express';
import multer from 'multer';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import {
  getProducts,
  getProductBySlug,
  searchSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
  adminGetProducts,
} from '../controllers/productController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Public
router.get('/', getProducts);
router.get('/search/suggestions', searchSuggestions);
router.get('/:slug', getProductBySlug);

// Admin
router.get('/admin/all', verifyToken, requireAdmin, adminGetProducts);
router.post('/', verifyToken, requireAdmin, upload.array('images', 10), createProduct);
router.put('/:id', verifyToken, requireAdmin, upload.array('images', 10), updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;
