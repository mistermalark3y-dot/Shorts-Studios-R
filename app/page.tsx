import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ContentJob = {
  id: string;
  title: string;
  status: string;
  channels:
    | {
        title: string;
      }
    | {
        title: string;
      }[]
    | null;
};

type Channel = {
  id: string;
  total_views: number | string | null;
};

export default async function HomePage() {
  const supabase = getSupabaseClient();

  let connectedChannels = 0;
  let totalViews = 0;
  let jobs: ContentJob[] = [];
  let databaseError: string | null = null;

  if (!supabase) {
    databaseError =
      "Supabase environment variables are missing. Check .env.local.";
  } else {
    const [
      { data: channels, error: channelsError },
      { data: contentJobs, error: jobsError },
    ] = await Promise.all([
      supabase.from("channels").select("id, total_views"),

      supabase
        .from("content_jobs")
        .select(`
          id,
          title,
          status,
          channels (
            title
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const error = channelsError ?? jobsError;

    if (error) {
      databaseError = error.message;
    } else {
      const channelRows = (channels ?? []) as Channel[];

      connectedChannels = channelRows.length;

      totalViews = channelRows.reduce(
        (total, channel) => total + Number(channel.total_views ?? 0),
        0,
      );

      jobs = (contentJobs ?? []) as ContentJob[];
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            Multi-channel production dashboard
          </p>

          <h1 className="text-3xl font-semibold">Overview</h1>
        </div>

        <Link
          href="/channels"
          className="rounded-lg bg-white px-4 py-2 text-center font-medium text-black"
        >
          Connect a channel
        </Link>
      </div>

      {databaseError && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
          Database error: {databaseError}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Connected channels"
          value={connectedChannels.toLocaleString()}
          helper="Loaded from Supabase"
        />

        <StatCard
          label="Videos in production"
          value={jobs.length.toLocaleString()}
          helper="Active content jobs"
        />

        <StatCard
          label="Total channel views"
          value={totalViews.toLocaleString()}
          helper="Current saved channel totals"
        />

        <StatCard
          label="Estimated revenue"
          value="$0"
          helper="Revenue tracking will be added later"
        />
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-lg font-medium">Production queue</h2>
        </div>

        <div className="divide-y divide-zinc-800">
          {jobs.length === 0 ? (
            <div className="p-4 text-sm text-zinc-400">
              No content jobs have been created yet.
            </div>
          ) : (
            jobs.map((job) => {
              const relation = job.channels;

              const channelName = Array.isArray(relation)
                ? relation[0]?.title
                : relation?.title;

              return (
                <div
                  key={job.id}
                  className="grid gap-2 p-4 sm:grid-cols-[1fr_180px_100px] sm:items-center"
                >
                  <span className="font-medium">{job.title}</span>

                  <span className="text-sm text-zinc-400">
                    {channelName ?? "No channel"}
                  </span>

                  <span className="w-fit rounded-full bg-zinc-800 px-2 py-1 text-xs capitalize">
                    {job.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}