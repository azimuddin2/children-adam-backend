import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

const app: Application = express();

// parsers
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }),
);

// application routes
app.use('/api/v1', router);

app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'Children Of Adam App Backend Running',
  });
});

const test = async (req: Request, res: Response) => {
  // Promise.reject();
};
app.get('/', test);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
