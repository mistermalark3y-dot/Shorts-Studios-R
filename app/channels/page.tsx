import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Channel = {
  id: string;
  title: string;
  handle: string | null;
  subscribers: number | string | null;
  total_views: number | string | null;
  video_count: number | string | null;
};

export default async function ChannelsPage() {
  const supabase = getSupabaseClient();

  let channels: Channel[] = [];
  let databaseError: string | null = null;

  if (!supabase) {
    databaseError =
      "Supabase environment variables are missing. Check .env.local.";
  } else {
    const { data, error } = await supabase
      .from("channels")
      .select(
        "id, title, handle, subscribers, total_views, video_count",
      )
      .order("created_at", { ascending: false });

    if (error) {
      databaseError = error.message;
    } else {
      channels = (data ?? []) as Channel[];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            Manage every brand in one place
          </p>

          <h1 className="text-3xl font-semibold">Channels</h1>
        </div>

        <a
          href="/api/youtube/connect"
          className="rounded-lg bg-white px-4 py-2 text-center font-medium text-black"
        >
          Connect another channel
        </a>
      </div>

      {databaseError && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
          Database error: {databaseError}
        </div>
      )}

      {channels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
          <h2 className="text-xl font-medium">
            No channels connected yet
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Connect a real YouTube channel securely through Google.
          </p>

          <a
            href="/api/youtube/connect"
            className="mt-5 inline-block rounded-lg bg-white px-4 py-2 font-medium text-black"
          >
            Connect YouTube
          </a>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {channels.map((channel) => (
            <article
              key={channel.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium">
                    {channel.title}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    {channel.handle ?? "No handle available"}
                  </p>
                </div>

                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  Connected
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-500">
                    Subscribers
                  </p>

                  <p className="mt-1 font-medium">
                    {Number(
                      channel.subscribers ?? 0,
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-500">
                    Total views
                  </p>

                  <p className="mt-1 font-medium">
                    {Number(
                      channel.total_views ?? 0,
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-zinc-950 p-3">
                  <p className="text-xs text-zinc-500">
                    Videos
                  </p>

                  <p className="mt-1 font-medium">
                    {Number(
                      channel.video_count ?? 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}