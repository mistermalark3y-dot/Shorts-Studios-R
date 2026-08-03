import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing from .env.local" },
      { status: 500 },
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      input: "Reply with exactly: Shorts Studio AI is connected",
      max_output_tokens: 30,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error: data?.error?.message ?? "OpenAI request failed",
      },
      { status: response.status },
    );
  }

  return NextResponse.json({
    success: true,
    message: data.output_text,
  });
}