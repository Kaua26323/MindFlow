import path from 'path';
import express from 'express';
import flash from 'express-flash';
import csrf from '@dr.pogodin/csurf';
import cookieParse from 'cookie-parser';
import { engine } from 'express-handlebars';
import methodOverride from 'method-override';
import { routes } from './web/routes/index.ts';

import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { drizzleDatabase } from '@/infra/db/drizzle/connection.ts';

import { errorHandler } from '@/web/middlewares/errorHandler.ts';
import { notFoundHandler } from '@/web/middlewares/notFoundHandler.ts';
import { catchFlashMessage } from '@/web/middlewares/catchFlashMessage.ts';

const app = express();
const PostgresStore = connectPgSimple(session);

app.set('trust proxy', 1);

app.use(
  session({
    store: new PostgresStore({
      pool: drizzleDatabase.pool,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.CURRENT_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
    },
  }),
);

app.use(flash());

app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParse(process.env.COOKIES_SECRET));
app.use(express.static(path.resolve('src/web/public')));

// express-handlebars
app.engine(
  'handlebars',
  engine({
    partialsDir: path.resolve('src/web/views/partials'),
    helpers: {
      formatDate: (date: Date) => {
        if (!date) return '';
        return date.toDateString();
      },

      compare: (a: unknown, b: unknown) => {
        return a === b;
      },
    },
  }),
);
app.set('view engine', 'handlebars');
app.set('views', path.resolve('src/web/views'));

// csrf protection
// @ts-expect-error: Inconsistência de tipagem da lib entre ESM e CJS
const csrfProtection = csrf();
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

//Global middlewares
app.use(catchFlashMessage);

app.use(routes);

// Errors
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
