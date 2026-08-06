import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  BarChart3,
  FileText,
  Image,
  Mic,
  Search,
  Send,
  Video,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { ScriptEditor } from "@/components/ScriptEditor";
import { ResearchEditor } from "@/components/ResearchEditor";

type Props = {
  params: {
    id: string;
  };
};

const workspaceSteps = [
  { label: "Research", icon: Search, status: "Not started" },
  { label: "Script", icon: FileText, status: "In progress" },
  { label: "Thumbnail", icon: Image, status: "Not started" },
  { label: "Voice", icon: Mic, status: "Not started" },
  { label: "Video", icon: Video, status: "Not started" },
  { label: "Publish", icon: Send, status: "Not started" },
  { label: "Analytics", icon: BarChart3, status: "Not started" },
];

export default async function ScriptPage({ params }: Props) {
  const ideaId = params?.id;

  if (!ideaId || ideaId === "undefined") {
    redirect("/content");
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/40 p-5 text-red-200">
        Supabase is not configured.
      </div>
    );
  }

  const { data: idea, error } = await supabase
    .from("ideas")
    .select(
      "id, title, topic, hook, script, status, viral_score, research_notes, research_facts, research_sources",
    )
    .eq("id", ideaId)
    .single();

  if (error) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/40 p-5 text-red-200">
        Database error: {error.message}
      </div>
    );
  }

  if (!idea) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link
            href="/content"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Back to production board
          </Link>

          <p className="mt-5 text-sm text-zinc-400">
            Project workspace
          </p>

          <h1 className="mt-1 text-3xl font-semibold">
            {idea.title}
          </h1>

          <p className="mt-2 text-zinc-400">
            {idea.topic}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm capitalize text-zinc-300">
            {idea.status}
          </span>

          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300">
            Score {idea.viral_score}/100
          </span>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {workspaceSteps.map(({ label, icon: Icon, status }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <Icon className="h-4 w-4 text-zinc-400" />

            <p className="mt-3 text-sm font-medium">
              {label}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {status}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Opening hook
        </p>

        <p className="mt-2 text-lg">
          {idea.hook ?? "No hook yet."}
        </p>
      </section>

      <ResearchEditor
        ideaId={idea.id}
        initialNotes={idea.research_notes ?? ""}
        initialFacts={idea.research_facts ?? ""}
        initialSources={idea.research_sources ?? ""}
      />

      <ScriptEditor
        ideaId={idea.id}
        initialScript={idea.script ?? ""}
        title={idea.title}
        topic={idea.topic}
        hook={idea.hook}
        researchFacts={idea.research_facts ?? ""}
        researchNotes={idea.research_notes ?? ""}
      />
    </div>
  );
}