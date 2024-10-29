import { Router } from 'express';
import authRouter from './auth.js';
import postsRouter from './posts.js';
import usersRouter from './users.js';
import likesRouter from "./likes.js";
import commentsRouter from "./comments.js"
import notifications from "./notifications.js"
import router from './auth.js';

const routes = new Router();

routes.use(authRouter);
routes.use(postsRouter);
routes.use(usersRouter);
routes.use(likesRouter);
routes.use(commentsRouter)
routes.use(notifications)


export default routes;