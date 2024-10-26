import { Router } from 'express';
import authRouter from './auth.js';
import postsRouter from './posts.js';
import usersRouter from './users.js';

const routes = new Router();

routes.use(authRouter);
routes.use(postsRouter);
routes.use(usersRouter);

export default routes;