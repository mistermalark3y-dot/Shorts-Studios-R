import { getSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ScriptEditor } from "@/components/ScriptEditor";

type Props = {
  params: {
    id: string;
  };
};

export default async function ScriptPage({
  params,
}: Props) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return <div>Supabase is not configured.</div>;
  }

  const { data: idea, error } = await supabase
    .from("ideas")
    .select("id, title, topic, hook, script")
    .eq("id", params.id)
    .single();

  if (error || !idea) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-400">
          Script Workspace
        </p>

        <h1 className="text-3xl font-semibold">
          {idea.title}
        </h1>

        <p className="mt-2 text-zinc-400">
          {idea.topic}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-2 font-medium">Hook</h2>

        <p>{idea.hook ?? "No hook yet."}</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-2 font-medium">
          Script
        </h2>

        <ScriptEditor
  ideaId={idea.id}
  initialScript={idea.script ?? ""}
  title={idea.title}
  topic={idea.topic}
  hook={idea.hook}
/>
      </div>
    </div>
  );
}