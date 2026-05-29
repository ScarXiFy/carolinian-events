# Design Specification: Database Connection Fix, Security Middleware, & Real-Time Role Updates

**Date**: 2026-05-29  
**Status**: Pending Review  

---

## 1. Goal Description
This design document addresses the database connection problems, secures the application routes, and implements the requested three-user-role flow (Student, Organizer, Admin) with real-time session synchronization.

---

## 2. Technical Details & Proposed Changes

### 2.1 Database Configuration and Resiliency
To fix the Supabase connection issues and prevent future errors caused by bracket placeholders or missing variables:
- **Fallback Logic**: The configuration parser will check for `DATABASE_URL` first. If missing, it will automatically fall back to `NEXT_PUBLIC_SUPABASE_URL`.
- **String Sanitization**: The connection string parser will detect square brackets `[...]` inside the password segment of the URL and strip them out.
- **File to Modify**: [database-config.mjs](file:///d:/GitHub/carolinian-events/src/lib/database-config.mjs)

```javascript
// Example transformation:
// "postgresql://postgres:[MileahDaGoat123!]@db.qagfpvutttcbfsbvnofx.supabase.co:5432/postgres"
// becomes
// "postgresql://postgres:MileahDaGoat123!@db.qagfpvutttcbfsbvnofx.supabase.co:5432/postgres"
```

### 2.2 Security Middleware Activation
The project contains route protection logic inside `src/proxy.ts`. However, Next.js expects the middleware entry point to be named `middleware.ts` in the `src/` folder.
- **Action**: Rename [proxy.ts](file:///d:/GitHub/carolinian-events/src/proxy.ts) to `src/middleware.ts`.
- **Result**: Next.js will automatically detect and run the route protection middleware on every matching request, securing `/admin` and `/events/create` at the routing layer.

### 2.3 Real-Time User Role Updates in NextAuth
Currently, NextAuth stores the user's role inside the JSON Web Token (JWT) only during the initial login. If an Admin approves a student's organizer request in the database, the active student's session remains cached with `role: 'Student'` until they manually log out and log back in.
- **File to Modify**: [auth.ts](file:///d:/GitHub/carolinian-events/src/auth.ts)
- **Action**: Update the NextAuth `jwt` callback to fetch the user's current role directly from the database using `getUserById` on session verification.
- **Result**: Instant role updates. The moment an Admin approves a request, the student is dynamically upgraded to an `Organizer` on their next action/page load without having to log out.

### 2.4 User Roles & Approval Flow
- The application will enforce three distinct user roles:
  1. **Student** (Default upon signup)
  2. **Organizer** (Allowed to create and edit events once approved)
  3. **Admin** (Allowed to approve/reject organizer requests)
- Admin emails are configured via the `ADMIN_EMAILS` environment variable in `.env.local` as a comma-separated list.
- Admin approves requests via the `/admin` dashboard.
- Users signing up via GitHub/Google OAuth are saved to the `public.users` table in Supabase. (Note: Because this is handled via NextAuth directly in PostgreSQL, these users will be visible in the Supabase **Table Editor**, not the "Authentication" dashboard).

---

## 3. Verification Plan

### 3.1 Automated Tests
- Run `npm run test` to verify all 62 existing tests pass successfully.
- Write new unit tests in `src/lib/database-config.test.mjs` to verify:
  - Fallback from `DATABASE_URL` to `NEXT_PUBLIC_SUPABASE_URL`.
  - Automatic cleaning of square brackets `[...]` in the database URL.

### 3.2 Manual Verification
1. Verify database connectivity using the corrected `.env.local`.
2. Access `/events/create` and `/admin` as an unauthenticated user to confirm they are blocked and redirect to `/login`.
3. Sign up as a new Student, submit an Organizer request, approve it using an Admin account, and verify that the Student's session instantly displays the "Organizer" role and the "Create Event" button without needing to log out.
