import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { googleAIController } from "../controllers/googleAIContoller.js";
import checkApiRequestLimit from "../middlewares/checkApiRequestLimit.js";

const googleAIRouter = express.Router();

googleAIRouter.post(
  "/generate-content",
  isAuthenticated,
  checkApiRequestLimit,
  googleAIController
);

export default googleAIRouter;
