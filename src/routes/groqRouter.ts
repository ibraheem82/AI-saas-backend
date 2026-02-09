import express, { Router } from 'express';
import { groqController } from '../controllers/groqController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import checkApiRequestLimit from '../middlewares/checkApiRequestLimit.js';

const groqRouter: Router = express.Router();

groqRouter.post(
    '/generate-content',
    isAuthenticated,
    checkApiRequestLimit,
    groqController
);

export default groqRouter;