CREATE TABLE "chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"page" integer NOT NULL,
	"position" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"filename" text NOT NULL,
	"collection" text DEFAULT 'General' NOT NULL,
	"size_bytes" integer NOT NULL,
	"page_count" integer NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'ready' NOT NULL,
	"file" "bytea" NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"search_id" integer NOT NULL,
	"chunk_id" integer NOT NULL,
	"rank" integer NOT NULL,
	"score" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"query" text NOT NULL,
	"normalized_query" text NOT NULL,
	"embedding" "bytea" NOT NULL,
	"result_count" integer DEFAULT 0 NOT NULL,
	"top_score" real DEFAULT 0 NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"run_count" integer DEFAULT 1 NOT NULL,
	"library_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_run_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"library_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_results" ADD CONSTRAINT "search_results_search_id_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."searches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_results" ADD CONSTRAINT "search_results_chunk_id_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searches" ADD CONSTRAINT "searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chunks_user_idx" ON "chunks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chunks_document_idx" ON "chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_user_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_results_search_idx" ON "search_results" USING btree ("search_id");--> statement-breakpoint
CREATE UNIQUE INDEX "searches_user_query_idx" ON "searches" USING btree ("user_id","normalized_query");--> statement-breakpoint
CREATE INDEX "searches_user_last_run_idx" ON "searches" USING btree ("user_id","last_run_at");