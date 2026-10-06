import {Router} from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import {createCategory, getCategories, createTransaction, getTransactions} from '../controllers/financeController';

const router = Router();

// todas as rotas necessitam de autentificacao
router.use(verifyToken);

router.post('/categories', createCategory);
router.get('/categories',getCategories);

router.post('/transactions',createTransaction);
router.get('/transactions',getTransactions);

export default router;