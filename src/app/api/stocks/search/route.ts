import { NextResponse } from "next/server";

import { searchStockOptions } from "@/lib/stock-options";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const stocks = await searchStockOptions(query);

  return NextResponse.json({ stocks });
}
