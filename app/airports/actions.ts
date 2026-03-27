"use server";

import { createClient } from "@/lib/supabase/server";
import type { Airport } from "@/lib/supabase/types";

const PAGE_SIZE = 50;

export async function loadMoreAirports(
  offset: number,
  q?: string,
  country?: string,
  major?: boolean
): Promise<Airport[]> {
  const supabase = await createClient();
  let query = supabase.from("airports").select("*");

  if (q) {
    query = query.textSearch("search_vector", q);
  }
  if (country) {
    query = query.eq("country_code", country);
  }
  if (major) {
    query = query.eq("is_major", true);
  }

  const { data } = await query
    .order("name")
    .range(offset, offset + PAGE_SIZE - 1);

  return (data ?? []) as Airport[];
}
