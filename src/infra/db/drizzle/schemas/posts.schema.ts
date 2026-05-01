import { usersTable } from './users.schema.ts';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const postsTable = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  user_id: uuid('user_id')
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at'),
});
