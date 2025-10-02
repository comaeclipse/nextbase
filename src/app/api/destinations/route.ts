import { NextResponse } from "next/server";

import { loadDestinations } from "@/lib/destination-store";

export async function GET() {
  try {
    const destinations = await loadDestinations();
    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Failed to load destinations", error);
    return NextResponse.json({ message: "Unable to load destinations" }, { status: 500 });
  }
}
