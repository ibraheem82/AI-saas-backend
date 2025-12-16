import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { handlePaystackPayment, handleFreeSubscription, verifyPayment } from "../controllers/handlePaystackPayment.js";

const paystackRouter = express.Router();

paystackRouter.post("/checkout", isAuthenticated, handlePaystackPayment);
paystackRouter.post("/verify-payment/:reference", verifyPayment);
paystackRouter.post("/free-plan", isAuthenticated, handleFreeSubscription);

export default paystackRouter;
