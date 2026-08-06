import Link from "next/link";
import { FileText } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type ScriptItem = {
  id: string;
  title: string;
  topic: string;
  script: string | null;
  status: string;
  updated_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/40 p-5 text-red-200">
        Supabase is not configured.
      </div>
    );
  }

  const { data, error } = await supabase
    .from("ideas")
    .select("id, title, topic, script, status, updated_at")
    .or("script.not.is.null,status.eq.script")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/40 p-5 text-red-200">
        Database error: {error.message}
      </div>
    );
  }

  const scripts = (data ?? []) as ScriptItem[];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-400">
          Review and continue your saved scripts
        </p>

        <h1 className="text-3xl font-semibold">
          Scripts
        </h1>
      </div>

      {scripts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-zinc-500" />

          <h2 className="mt-4 text-lg font-medium">
            No scripts yet
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Generate a script from an idea on the production board.
          </p>

          <Link
            href="/content"
            className="mt-5 inline-block rounded-lg bg-white px-4 py-2 font-medium text-black"
          >
            Open production board
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {scripts.map((script) => (
            <Link
              key={script.id}
              href={`/scripts/${script.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-400">
                    {script.topic}
                  </p>

                  <h2 className="mt-1 text-lg font-medium">
                    {script.title}
                  </h2>
                </div>

                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs capitalize text-zinc-300">
                  {script.status}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 text-sm text-zinc-400">
                {script.script?.trim() || "Script has not been written yet."}
              </p>

              <p className="mt-5 text-sm font-medium">
                Open workspace →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}