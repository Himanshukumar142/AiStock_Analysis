import { Router } from 'express';
import { analyzeCompany } from '../controllers/analyzeController.js';
import { getStockChart, getAutocomplete } from '../controllers/chartController.js';

const router = Router();

// POST /api/analyze — runs the full AI analysis
router.post('/analyze', analyzeCompany);

// GET /api/chart/:company — returns stock price history fast (no AI)
router.get('/chart/:company', getStockChart);

// GET /api/autocomplete — returns company search recommendations
router.get('/autocomplete', getAutocomplete);

export default router;
