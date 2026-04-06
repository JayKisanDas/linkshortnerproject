import { getLinkByShortCode } from "@/data/links";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortcode: string }> },
) {
  const { shortcode } = await params;

  const link = await getLinkByShortCode(shortcode);

  if (!link) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const parsed = new URL(link.url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new Response("Invalid redirect destination", { status: 400 });
    }
  } catch {
    return new Response("Invalid redirect destination", { status: 400 });
  }

  return NextResponse.redirect(link.url, { status: 308 });
}
