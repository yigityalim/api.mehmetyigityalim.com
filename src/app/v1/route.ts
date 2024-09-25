import { NextResponse } from "next/server";

const data = {
  error: "Global API route not published",
  status: 404,
};

const res = new NextResponse(JSON.stringify(data), {
  status: 404,
  headers: {
    "Content-Type": "application/json",
  },
});

export const GET = async () => res;
export const POST = async () => res;
export const PUT = async () => res;
export const PATCH = async () => res;
export const DELETE = async () => res;
