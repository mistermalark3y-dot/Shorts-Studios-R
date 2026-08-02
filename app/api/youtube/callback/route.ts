import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type YouTubeChannelResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      customUrl?: string;
    };
    statistics?: {
      subscriberCount?: string;
      viewCount?: string;
      videoCount?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !appUrl ||
    !clientId ||
    !clientSecret ||
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return NextResponse.json(
      { error: "Required environment variables are missing." },
      { status: 500 },
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("youtube_oauth_state")?.value;
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${appUrl}/channels?error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (!code || !returnedState || !savedState || returnedState !== savedState) {
    return NextResponse.json(
      { error: "Invalid OAuth callback state." },
      { status: 400 },
    );
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${appUrl}/api/youtube/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokens.access_token) {
    return NextResponse.json(
      {
        error: tokens.error_description ?? tokens.error ?? "Token exchange failed.",
      },
      { status: 400 },
    );
  }

  const channelResponse = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    },
  );

  const channelData =
    (await channelResponse.json()) as YouTubeChannelResponse;

  const channel = channelData.items?.[0];

  if (!channelResponse.ok || !channel) {
    return NextResponse.json(
      {
        error:
          channelData.error?.message ??
          "No YouTube channel was found for this Google account.",
      },
      { status: 400 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error: upsertError } = await supabase.from("channels").upsert(
    {
      youtube_channel_id: channel.id,
      title: channel.snippet?.title ?? "Untitled channel",
      handle: channel.snippet?.customUrl ?? null,
      subscribers: Number(channel.statistics?.subscriberCount ?? 0),
      total_views: Number(channel.statistics?.viewCount ?? 0),
      video_count: Number(channel.statistics?.videoCount ?? 0),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "youtube_channel_id",
    },
  );

  if (upsertError) {
    return NextResponse.json(
      { error: upsertError.message },
      { status: 500 },
    );
  }

  const response = NextResponse.redirect(`${appUrl}/channels?connected=1`);

  response.cookies.set("youtube_oauth_state", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}