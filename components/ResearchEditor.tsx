"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type ResearchEditorProps = {
  ideaId: string;
  initialNotes: string;
  initialFacts: string;
  initialSources: string;
};

export function ResearchEditor({
  ideaId,
  initialNotes,
  initialFacts,
  initialSources,
}: ResearchEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [facts, setFacts] = useState(initialFacts);
  const [sources, setSources] = useState(initialSources);

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [researching, setResearching] = useState(false);
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
          research_notes: notes,
          research_facts: facts,
          research_sources: sources,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ideaId);

      setSaveStatus(error ? "error" : "saved");
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [notes, facts, sources, ideaId]);

  function generateMockResearch() {
    setResearching(true);

    window.setTimeout(() => {
      setFacts(
        [
          "Viewers decide whether to keep watching within the opening seconds.",
          "A focused Short usually performs better than one covering too many points.",
          "Specific examples make educational content easier to understand.",
          "A clear final takeaway improves memorability.",
        ].join("\n"),
      );

      setSources(
        [
          "YouTube Creator Academy",
          "Google Trends",
          "Relevant competitor videos",
          "Primary sources should be added before publishing",
        ].join("\n"),
      );

      setNotes(
        [
          "Lead with the strongest surprising point.",
          "Keep each sentence short and easy to narrate.",
          "Use original examples instead of copying competitor wording.",
          "Verify factual claims before generating the final script.",
          "Plan a visual change every few seconds.",
        ].join("\n"),
      );

      setResearching(false);
    }, 800);
  }

  const statusText = {
    idle: "Ready",
    saving: "Saving...",
    saved: "Saved ✓",
    error: "Save failed",
  }[saveStatus];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Research</h2>

          <p className="mt-1 text-sm text-zinc-400">
            Save facts, sources, and notes for this video.
          </p>
        </div>

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
            onClick={generateMockResearch}
            disabled={researching}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {researching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}

            {researching ? "Researching..." : "Research topic"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Useful facts</span>

          <textarea
            value={facts}
            onChange={(event) => setFacts(event.target.value)}
            className="mt-2 min-h-48 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-4"
            placeholder="Add one fact per line..."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Sources</span>

          <textarea
            value={sources}
            onChange={(event) => setSources(event.target.value)}
            className="mt-2 min-h-48 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-4"
            placeholder="Add source links or source names..."
          />
        </label>

        <label className="block lg:col-span-2">
          <span className="text-sm font-medium">Research notes</span>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-2 min-h-48 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-4"
            placeholder="Summaries, angles, questions, competitor notes..."
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Changes save automatically after you stop typing.
      </p>
    </section>
  );
}