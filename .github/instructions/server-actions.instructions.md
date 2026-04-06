---
description: Read this file before implementing or modifying server actions for data mutations in the project.
---

# Server Actions

All data mutations **must** use Next.js Server Actions.

## Rules

- **File naming:** Action files must be named `actions.ts` and colocated with the component that calls them (e.g., `app/dashboard/actions.ts`).
- **Client components:** Server actions must only be called from client components (`"use client"`). Action files use `"use server"` at the top.
- **TypeScript types:** All parameters must use explicit TypeScript types. **Never use `FormData`.**
- **Zod validation:** Validate all input with Zod at the start of every action.
- **Authentication:** Check for a logged-in user via Clerk's `auth()` before any database operation. Return `{ error: "Unauthorized" }` if unauthenticated.
- **Database via helpers:** Never use Drizzle queries directly in actions. Always call helper functions from the `/data` directory.
- **Error handling:** Never throw errors from server actions. Always return `{ error: "..." }` on failure and `{ success: true, data: ... }` on success.

## Example

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createLinkForUser } from "@/data/links";

const schema = z.object({
  url: z.string().url(),
  customSlug: z.string().min(3).optional(),
});

type CreateLinkInput = z.infer<typeof schema>;

export async function createLink(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  try {
    const validated = schema.parse(input);
    const link = await createLinkForUser(userId, validated);
    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Invalid input" };
    return { error: "Failed to create link" };
  }
}
```
