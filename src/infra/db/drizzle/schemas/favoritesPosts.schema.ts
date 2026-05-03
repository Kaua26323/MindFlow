import { usersTable } from './users.schema.ts';
import { postsTable } from './posts.schema.ts';
import { pgTable, primaryKey, uuid, timestamp } from 'drizzle-orm/pg-core';

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const favoritesPostsTable = pgTable(
  'favorites_posts',
  {
    user_id: uuid('user_id')
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    post_id: uuid('post_id')
      .references(() => postsTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.post_id] })],
);

export type FavoritePost = InferSelectModel<typeof favoritesPostsTable>;
export type NewFavoritePost = InferInsertModel<typeof favoritesPostsTable>;
