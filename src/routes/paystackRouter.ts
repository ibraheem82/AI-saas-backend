import express, { Router } from 'express';
import {
    handlePaystackPayment,
    verifyPayment,
    handleFreeSubscription,
} from '../controllers/handlePaystackPayment.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const paystackRouter: Router = express.Router();

paystackRouter.post('/checkout', isAuthenticated, handlePaystackPayment);
paystackRouter.get('/verify/:reference', verifyPayment);
paystackRouter.post('/free', isAuthenticated, handleFreeSubscription);

export default paystackRouter;
