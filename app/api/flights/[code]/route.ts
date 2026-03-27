import { getFlightStatus } from "@/lib/aviation-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const date =
    request.nextUrl.searchParams.get("date") ??
    new Date().toISOString().split("T")[0];

  try {
    const flights = await getFlightStatus(code, date);
    return NextResponse.json(flights, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch flight status";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
