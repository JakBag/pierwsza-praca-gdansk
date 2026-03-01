import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint wycofany. Uzyj /api/submit-jobs-batch." },
    { status: 410 }
  );
}
