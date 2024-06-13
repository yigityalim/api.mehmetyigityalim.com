import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function GET({ params }: Params) {
  const data = {
    name: "Mehmet Yiğit Yalım | id",
    status: 200,
    data: params,
  };

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
