import { pgTable, text, jsonb, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Admin-managed site content (settings, teachers, members, albums, ...) stored as one document.
export const siteContent = pgTable('site_content', {
  id: text().primaryKey(),
  data: jsonb().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// Anonymous "NGL" messages submitted by visitors.
export const nglMessages = pgTable('ngl_messages', {
  id: text().primaryKey(),
  recipientId: text('recipient_id').notNull().default('CLASS'),
  recipientName: text('recipient_name').notNull().default('Seluruh XII Social'),
  message: text().notNull(),
  stickerTag: text('sticker_tag').notNull().default('confession'),
  reply: text(),
  replyAt: timestamp('reply_at', { withTimezone: true }),
  likesCount: integer('likes_count').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Admin login sessions.
export const adminSessions = pgTable('admin_sessions', {
  token: text().primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
