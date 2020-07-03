import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import controller from './controller';
import { browserMiddleware } from './middlewares';

(async () => {
  dotenv.config();
  await mongoose.createConnection(process.env.MONGO, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  const app = express();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT, // limit each IP to 100 requests per windowMs
  });

  app.set('trust proxy', 1);
  app.use(cors());
  app.use(helmet());
  app.use(limiter);

  app.get('/run', browserMiddleware, controller.run);
  app.get('/check', controller.check);
  app.get(
    '/savestate',
    browserMiddleware,
    controller.saveStateWhatsapp,
  );

  app.listen(process.env.PORT || 5000, () =>
    console.log(
      `Server up & running on port: ${process.env.PORT || 5000}`,
    ),
  );
})();
