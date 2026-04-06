"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createLinkForUser,
  deleteLinkForUser,
  updateLinkForUser,
} from "@/data/links";

const createLinkSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, "Only http and https URLs are allowed"),
  customSlug: z
    .string()
    .min(3, "Custom slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Only lowercase letters, numbers, and hyphens are allowed",
    )
    .optional()
    .or(z.literal("")),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLink(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  try {
    const validated = createLinkSchema.parse(input);
    const link = await createLinkForUser(userId, {
      url: validated.url,
      customSlug: validated.customSlug || undefined,
    });
    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError)
      return { error: error.issues[0]?.message ?? "Invalid input" };
    return { error: "Failed to create link" };
  }
}

const updateLinkSchema = z.object({
  id: z.string().min(1),
  url: z
    .string()
    .url("Please enter a valid URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, "Only http and https URLs are allowed"),
  shortCode: z
    .string()
    .min(3, "Short code must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Only lowercase letters, numbers, and hyphens are allowed",
    ),
});

type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export async function updateLink(input: UpdateLinkInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  try {
    const validated = updateLinkSchema.parse(input);
    const link = await updateLinkForUser(userId, validated.id, {
      url: validated.url,
      shortCode: validated.shortCode,
    });
    if (!link) return { error: "Link not found" };
    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError)
      return { error: error.issues[0]?.message ?? "Invalid input" };
    return { error: "Failed to update link" };
  }
}

const deleteLinkSchema = z.object({
  id: z.string().min(1),
});

type DeleteLinkInput = z.infer<typeof deleteLinkSchema>;

export async function deleteLink(input: DeleteLinkInput) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  try {
    const validated = deleteLinkSchema.parse(input);
    const deleted = await deleteLinkForUser(userId, validated.id);
    if (!deleted) return { error: "Link not found" };
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError)
      return { error: error.issues[0]?.message ?? "Invalid input" };
    return { error: "Failed to delete link" };
  }
}
