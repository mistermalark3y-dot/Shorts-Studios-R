"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type ScriptEditorProps = {
  ideaId: string;
  initialScript: string;
  title: string;
  topic: string;
  hook: string | null;
};

export function ScriptEditor({
  ideaId,
  initialScript,
  title,
  topic,
  hook,
}: ScriptEditorProps) {
  const [script, setScript] = useState(initialScript);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [generating, setGenerating] = useState(false);

  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setSaveStatus("saving");

    const timeout = window.setTimeout(async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setSaveStatus("error");
        return;
      }

      const { error } = await supabase
        .from("ideas")
        .update({
          script,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ideaId);

      setSaveStatus(error ? "error" : "saved");
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [script, ideaId]);

  function generateMockScript() {
    setGenerating(true);

    window.setTimeout(() => {
      const generatedScript = `${hook ?? `Here is what you need to know about ${topic}.`}

Most people overlook this, but ${topic.toLowerCase()} is becoming more important than ever.

First, ${title.toLowerCase()} matters because it creates immediate curiosity and gives the viewer a clear reason to keep watching.

Second, the strongest videos explain one useful point quickly instead of trying to cover everything at once.

Finally, end with a clear takeaway the viewer can remember or use immediately.

Follow for more short, useful videos like this.`;

      setScript(generatedScript);
      setGenerating(false);
    }, 800);
  }

  const statusText = {
    idle: "Ready",
    saving: "Saving...",
    saved: "Saved ✓",
    error: "Save failed",
  }[saveStatus];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium">Script</h2>

        <div className="flex items-center gap-3">
          <span
            className={`text-sm ${
              saveStatus === "error"
                ? "text-red-400"
                : "text-zinc-400"
            }`}
          >
            {statusText}
          </span>

          <button
            type="button"
            onClick={generateMockScript}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}

            {generating ? "Generating..." : "Generate script"}
          </button>
        </div>
      </div>

      <textarea
        value={script}
        onChange={(event) => setScript(event.target.value)}
        className="min-h-[400px] w-full rounded-lg border border-zinc-700 bg-zinc-950 p-4"
        placeholder="Write your script here..."
      />

      <p className="mt-2 text-xs text-zinc-500">
        Changes save automatically two seconds after you stop typing.
      </p>
    </div>
  );
}