import { getAirportDepartures } from "@/lib/aviation-api";
import { NextRequest, NextResponse } from "next/server";

function formatLocalISO(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

  const from =
    request.nextUrl.searchParams.get("from") ?? formatLocalISO(sixHoursAgo);
  const to =
    request.nextUrl.searchParams.get("to") ?? formatLocalISO(twelveHoursLater);

  try {
    const departures = await getAirportDepartures(code, from, to);
    return NextResponse.json(departures, {
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch departures";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
