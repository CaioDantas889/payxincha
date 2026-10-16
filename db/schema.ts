import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(), reference: text('reference').notNull(), trackingHash: text('tracking_hash').notNull(),
  name: text('name').notNull(), email: text('email').notNull(), phone: text('phone').notNull(),
  city: text('city').notNull(), state: text('state').notNull(), business: text('business').notNull(), revenue: text('revenue').notNull(),
  customerNote: text('customer_note').notNull().default(''),
  personType: text('person_type'), cpf: text('cpf'), birthDate: text('birth_date'), motherName: text('mother_name'),
  cnpj: text('cnpj'), legalName: text('legal_name'), tradeName: text('trade_name'),
  postalCode: text('postal_code'), street: text('street'), addressNumber: text('address_number'), complement: text('complement'), neighborhood: text('neighborhood'), landmark: text('landmark'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  publicMessage: text('public_message').notNull().default(''), internalNotes: text('internal_notes').notNull().default(''),
  createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(), consentVersion: text('consent_version').notNull(),
  revision: integer('revision').notNull().default(0), reviewedBy: text('reviewed_by'), lastReviewId: text('last_review_id'),
}, table => [uniqueIndex('applications_reference_unique').on(table.reference), uniqueIndex('applications_tracking_unique').on(table.trackingHash), index('applications_status_created').on(table.status, table.createdAt), index('applications_created').on(table.createdAt)]);
export const reviewEvents = sqliteTable('review_events', {
  id: text('id').primaryKey(), applicationId: text('application_id').notNull().references(() => applications.id),
  actorId: text('actor_id').notNull(), status: text('status').notNull(), publicMessage: text('public_message').notNull(), createdAt: text('created_at').notNull(),
}, table => [index('reviews_application').on(table.applicationId)]);
export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(), count: integer('count').notNull().default(0), expiresAt: integer('expires_at').notNull(),
}, table => [index('rate_limits_expiry').on(table.expiresAt)]);
export const deletionEvents = sqliteTable('deletion_events', {
  id: text('id').primaryKey(), applicationId: text('application_id').notNull(),
  actorId: text('actor_id').notNull(), createdAt: text('created_at').notNull(),
});
export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(), email: text('email').notNull(), name: text('name').notNull(), role: text('role', {enum:['owner','admin']}).notNull(),
  passwordHash: text('password_hash'), enabled: integer('enabled').notNull().default(1), authVersion: integer('auth_version').notNull().default(0),
  lastChange: text('last_change'), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
}, table => [uniqueIndex('admin_email_unique').on(table.email), uniqueIndex('single_admin_owner').on(table.role).where(sql`${table.role} = 'owner'`)]);
export const adminSessions = sqliteTable('admin_sessions', {
  hash: text('hash').primaryKey(), userId: text('user_id').notNull().references(() => adminUsers.id), authVersion: integer('auth_version').notNull(),
  csrfHash: text('csrf_hash').notNull(), expiresAt: integer('expires_at').notNull(), lastSeen: integer('last_seen').notNull(),
}, table => [index('admin_sessions_user').on(table.userId)]);
export const adminInvitations = sqliteTable('admin_invitations', {
  hash: text('hash').primaryKey(), userId: text('user_id').notNull().references(() => adminUsers.id), expiresAt: integer('expires_at').notNull(),
  usedAt: integer('used_at'), createdBy: text('created_by').notNull(),
}, table => [index('admin_invitations_user').on(table.userId)]);
export const adminAudit = sqliteTable('admin_audit', {
  id: text('id').primaryKey(), actorId: text('actor_id').notNull(), actorEmail: text('actor_email').notNull(), action: text('action').notNull(), targetId: text('target_id').notNull(), createdAt: text('created_at').notNull(),
});
