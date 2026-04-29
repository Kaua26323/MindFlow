import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  json,
  index,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// onnect-pg-simple table configuration
export const sessionsTable = pgTable(
  'session',
  {
    sid: varchar('sid').primaryKey().notNull(),
    sess: json('sess').notNull(),
    expire: timestamp('expire', { precision: 6 }).notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)],
);
