# Carolinian Events

Carolinian Events is a university event management app built with Next.js, Auth.js, and MySQL or Postgres. It supports student accounts, organizer requests, event management, RSVP tracking, notifications, email verification, and Supabase Storage event images.

## Production Readiness

Production deployments must configure a real database through `DATABASE_URL`. Local development can omit it to preview built-in sample events, but `NODE_ENV=production` fails fast when `DATABASE_URL` is missing.

## Required Environment Variables

Copy `.env.example` to `.env.local` for local work and configure the same values in your deployment provider.

Required for production:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_STORAGE_BUCKET`

Recommended:

- `ADMIN_EMAILS`, comma-separated admin account emails
- `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`

## Database Setup

For Supabase or Postgres, run `database/supabase-schema.sql` in the SQL editor or through your migration pipeline.

For MySQL, run `database/schema.sql`, then apply files in `database/migrations/` in order when upgrading an existing database.

After schema setup, create the first admin by setting `ADMIN_EMAILS` before signup or OAuth login.

## OAuth Setup

GitHub login is only enabled when both `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are present.

GitHub callback URLs:

- Local: `http://localhost:3000/api/auth/callback/github`
- Production: `https://YOUR_DOMAIN/api/auth/callback/github`

Google login is only enabled when both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are present.

Google callback URLs:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://YOUR_DOMAIN/api/auth/callback/google`

## Email Verification

Set SMTP credentials before launch. If SMTP is not configured, verification links are logged on the server, which is only acceptable for local development.

## Event Images

Create a Supabase Storage bucket matching `SUPABASE_STORAGE_BUCKET`, usually `event-images`. The app creates signed upload URLs server-side and stores public image URLs after upload.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

Run these before deploying:

```bash
npm test
npm run lint
npm run build
```

## Deployment Checklist

- Configure all required environment variables.
- Run the database schema and migrations.
- Verify SMTP by creating a new account and opening the email verification link.
- Verify OAuth callbacks for each enabled provider.
- Create or confirm an Admin user through `ADMIN_EMAILS`.
- Upload an event image through the create-event form.
- Create, edit, join, leave, cancel, and delete test events.
- Confirm production does not start without `DATABASE_URL`.

## Rollback Notes

Keep a database backup before applying migrations. Roll back application code and database migrations together when schema changes are involved.
