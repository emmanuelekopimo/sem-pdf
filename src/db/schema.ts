import { relations } from "drizzle-orm";
import {
  customType,
  index,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Stores a Float32Array embedding as raw bytes (384 floats = 1536 bytes). */
export const vector = customType<{ data: Float32Array; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  },
  fromDriver(value) {
    const copy = Buffer.from(value);
    return new Float32Array(copy.buffer, copy.byteOffset, copy.byteLength / 4);
  },
});

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  // Bumped whenever a document is added or removed, so saved search
  // results know when they are out of date.
  libraryVersion: integer("library_version").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    filename: text("filename").notNull(),
    collection: text("collection").notNull().default("General"),
    sizeBytes: integer("size_bytes").notNull(),
    pageCount: integer("page_count").notNull(),
    wordCount: integer("word_count").notNull().default(0),
    chunkCount: integer("chunk_count").notNull().default(0),
    // ready | no_text
    status: text("status").notNull().default("ready"),
    file: bytea("file").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("documents_user_idx").on(t.userId)],
);

export const chunks = pgTable(
  "chunks",
  {
    id: serial("id").primaryKey(),
    documentId: integer("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    page: integer("page").notNull(),
    position: integer("position").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding").notNull(),
  },
  (t) => [index("chunks_user_idx").on(t.userId), index("chunks_document_idx").on(t.documentId)],
);

export const searches = pgTable(
  "searches",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    normalizedQuery: text("normalized_query").notNull(),
    embedding: vector("embedding").notNull(),
    resultCount: integer("result_count").notNull().default(0),
    topScore: real("top_score").notNull().default(0),
    durationMs: integer("duration_ms").notNull().default(0),
    runCount: integer("run_count").notNull().default(1),
    libraryVersion: integer("library_version").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("searches_user_query_idx").on(t.userId, t.normalizedQuery),
    index("searches_user_last_run_idx").on(t.userId, t.lastRunAt),
  ],
);

export const searchResults = pgTable(
  "search_results",
  {
    id: serial("id").primaryKey(),
    searchId: integer("search_id")
      .notNull()
      .references(() => searches.id, { onDelete: "cascade" }),
    chunkId: integer("chunk_id")
      .notNull()
      .references(() => chunks.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
    score: real("score").notNull(),
  },
  (t) => [index("search_results_search_idx").on(t.searchId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  searches: many(searches),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, { fields: [documents.userId], references: [users.id] }),
  chunks: many(chunks),
}));

export const chunksRelations = relations(chunks, ({ one }) => ({
  document: one(documents, { fields: [chunks.documentId], references: [documents.id] }),
}));

export const searchesRelations = relations(searches, ({ many }) => ({
  results: many(searchResults),
}));

export const searchResultsRelations = relations(searchResults, ({ one }) => ({
  search: one(searches, { fields: [searchResults.searchId], references: [searches.id] }),
  chunk: one(chunks, { fields: [searchResults.chunkId], references: [chunks.id] }),
}));

export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Chunk = typeof chunks.$inferSelect;
export type Search = typeof searches.$inferSelect;
