import express, { Router } from 'express';
import { googleAIController } from '../controllers/googleAIController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import checkApiRequestLimit from '../middlewares/checkApiRequestLimit.js';

const googleAIRouter: Router = express.Router();

googleAIRouter.post(
    '/generate-content',
    isAuthenticated,
    checkApiRequestLimit,
    googleAIController
);

export default googleAIRouter;
