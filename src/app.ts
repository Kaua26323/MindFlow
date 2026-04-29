import path from 'path';
import express from 'express';
import flash from 'express-flash';
import { engine } from 'express-handlebars';
import type { NextFunction, Request, Response } from 'express';

import { drizzleDatabase } from '@/infra/db/drizzle/connection.ts';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const app = express();
const PostgresStore = connectPgSimple(session);

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
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
    },
  }),
);

app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve('src/web/public')));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.resolve('src/web/views'));

app.get('/', async (req, res: Response) => {
  const users = await drizzleDatabase.db.query.usersTable.findMany();
  console.log(users);
  res.render('home.handlebars');
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    console.error('Message:', err.message);
  } else {
    console.error('Something went wrong');
    console.error(err);
  }

  res.status(500).send('Erro interno do servidor');
});

export { app };
