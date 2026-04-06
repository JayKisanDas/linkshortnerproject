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

  return NextResponse.redirect(link.url, { status: 308 });
}
