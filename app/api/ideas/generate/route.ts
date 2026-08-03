import { NextRequest, NextResponse } from "next/server";

type GenerateIdeasRequest = {
  niche?: string;
  audience?: string;
  length?: string;
  count?: number;
};

const templates = [
  "3 {niche} tools most {audience} are ignoring",
  "The biggest {niche} mistake beginners make",
  "I tested the most popular {niche} advice",
  "What nobody tells you about {niche}",
  "The fastest way to improve at {niche}",
  "3 myths about {niche} that need to disappear",
  "Why most people fail at {niche}",
  "The surprising truth about {niche}",
  "Before you start {niche}, watch this",
  "The easiest {niche} shortcut that actually works",
  "I wish I knew this before learning {niche}",
  "The most overrated {niche} strategy",
];

function createHook(title: string) {
  return `Most people get this completely wrong: ${title.toLowerCase()}.`;
}

export async function POST(request: NextRequest) {
  let body: GenerateIdeasRequest;

  try {
    body = (await request.json()) as GenerateIdeasRequest;
  } catch {
    return NextResponse.json(
      { error: "The request body must contain valid JSON." },
      { status: 400 },
    );
  }

  const niche = body.niche?.trim() || "AI";
  const audience = body.audience?.trim() || "beginners";
  const length = body.length?.trim() || "30–45 seconds";

  const requestedCount = Number(body.count ?? 10);
  const count = Math.min(Math.max(requestedCount, 1), 20);

  const ideas = Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length];

    const title = template
      .replaceAll("{niche}", niche)
      .replaceAll("{audience}", audience);

    return {
      title,
      topic: niche,
      hook: createHook(title),
      viralScore: Math.max(65, 92 - index * 2),
      audience,
      targetLength: length,
      source: "mock",
    };
  });

  return NextResponse.json({
    success: true,
    ideas,
  });
}