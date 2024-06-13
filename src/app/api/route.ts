import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = {
    name: "Mehmet Yiğit Yalım",
    status: 200,
  };
  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
