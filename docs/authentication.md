# Authentication Guidelines

## Overview

All authentication in this project is handled exclusively by **Clerk**. No other auth libraries, custom JWT logic, session handling, or third-party auth providers should be used.

## Rules

### General

- **Only Clerk** — never implement custom auth, NextAuth, Auth.js, or any other authentication method.
- Use `@clerk/nextjs` for all auth primitives (`useUser`, `useAuth`, `auth()`, `currentUser()`, `ClerkProvider`, etc.).
- Associate database records with users via the `userId` returned from Clerk's `auth()`.
- Always verify user ownership server-side before reading or mutating user data. Never trust client-side auth state for security decisions.

### Route Protection

- `/dashboard` is a **protected route** — it must require the user to be signed in.
- Use Clerk's `auth()` in Server Components / Route Handlers to check authentication. Redirect unauthenticated users to sign-in.

```ts
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  // ...
}
```

### Homepage Redirect

- If an **authenticated** user visits the homepage (`/`), redirect them to `/dashboard`.

```ts
// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  // ...
}
```

### Sign In / Sign Up Modals

- Sign-in and sign-up flows must always be presented as a **Clerk modal** — never navigate to a dedicated `/sign-in` or `/sign-up` page.
- Use the `mode="modal"` prop on `<SignInButton>` and `<SignUpButton>`:

```tsx
import { SignInButton, SignUpButton } from "@clerk/nextjs";

<SignInButton mode="modal">
  <button>Sign In</button>
</SignInButton>

<SignUpButton mode="modal">
  <button>Sign Up</button>
</SignUpButton>
```

- Do **not** create `app/sign-in/` or `app/sign-up/` route directories.

## Quick Reference

| Scenario | Approach |
|---|---|
| Get current user (server) | `auth()` or `currentUser()` from `@clerk/nextjs/server` |
| Get current user (client) | `useUser()` or `useAuth()` from `@clerk/nextjs` |
| Protect a server route | Check `userId` from `auth()`, redirect if null |
| Redirect logged-in users | Check `userId` from `auth()`, redirect if present |
| Sign in / sign up UI | `<SignInButton mode="modal">` / `<SignUpButton mode="modal">` |
