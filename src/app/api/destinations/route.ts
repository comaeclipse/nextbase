import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Failed to load destinations", error);
    return NextResponse.json({ message: "Unable to load destinations" }, { status: 500 });
  }
}
