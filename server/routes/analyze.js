import { Router } from 'express';
import { analyzeCompany } from '../controllers/analyzeController.js';
import { getStockChart, getAutocomplete } from '../controllers/chartController.js';

const router = Router();


router.post('/analyze', analyzeCompany);


router.get('/chart/:company', getStockChart);


router.get('/autocomplete', getAutocomplete);

export default router;
