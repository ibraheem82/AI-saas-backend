import express from "express";
import { register, login, logout, userProfile, checkAuth } from "../controllers/usersControllers.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const usersRouter = express.Router();

usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.post("/logout", logout);
usersRouter.get("/profile", isAuthenticated, userProfile);
usersRouter.get("/auth/check", isAuthenticated, checkAuth);

export default usersRouter;