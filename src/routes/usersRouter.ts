import express, { Router } from 'express';
import {
    register,
    login,
    logout,
    userProfile,
    checkAuth,
    updateUserProfile,
} from '../controllers/usersControllers.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const usersRouter: Router = express.Router();

usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.post('/logout', logout);
usersRouter.get('/profile', isAuthenticated, userProfile);
usersRouter.put('/profile', isAuthenticated, updateUserProfile);
usersRouter.get('/auth/check', isAuthenticated, checkAuth);

export default usersRouter;
