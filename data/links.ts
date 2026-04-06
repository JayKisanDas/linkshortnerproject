import { db } from "@/db";
import { links } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { Link, NewLink } from "@/db/schema";
import { randomBytes } from "crypto";

export async function getLinksByUserId(userId: string): Promise<Link[]> {
  return db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.updatedAt));
}

export async function createLinkForUser(
  userId: string,
  data: { url: string; customSlug?: string },
): Promise<Link> {
  const shortCode = data.customSlug ?? randomBytes(4).toString("hex");

  const newLink: NewLink = {
    id: randomBytes(8).toString("hex"),
    userId,
    url: data.url,
    shortCode,
  };

  const [created] = await db.insert(links).values(newLink).returning();
  return created;
}

export async function updateLinkForUser(
  userId: string,
  linkId: string,
  data: { url: string; shortCode?: string },
): Promise<Link | null> {
  const [updated] = await db
    .update(links)
    .set({
      url: data.url,
      ...(data.shortCode ? { shortCode: data.shortCode } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(links.id, linkId), eq(links.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function deleteLinkForUser(
  userId: string,
  linkId: string,
): Promise<boolean> {
  const result = await db
    .delete(links)
    .where(and(eq(links.id, linkId), eq(links.userId, userId)))
    .returning();
  return result.length > 0;
}

export async function getLinkByShortCode(
  shortCode: string,
): Promise<Link | null> {
  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.shortCode, shortCode))
    .limit(1);
  return link ?? null;
}
