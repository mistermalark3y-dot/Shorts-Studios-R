"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type Channel = {
  id: string;
  title: string;
};

type GeneratedIdea = {
  title: string;
  topic: string;
  hook: string;
  viralScore: number;
  audience: string;
  targetLength: string;
  source: string;
};

type IdeaGeneratorProps = {
  channels: Channel[];
  onIdeasSaved: () => Promise<void> | void;
};

export function IdeaGenerator({
  channels,
  onIdeasSaved,
}: IdeaGeneratorProps) {
  const [channelId, setChannelId] = useState("");
  const [niche, setNiche] = useState("AI tools");
  const [audience, setAudience] = useState("beginners");
  const [length, setLength] = useState("30–45 seconds");
  const [count, setCount] = useState(5);

  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<number[]>([]);

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedChannelId =
    channelId || channels[0]?.id || "";

  async function generateIdeas() {
    if (!selectedChannelId) {
      setMessage("Connect or select a channel first.");
      return;
    }

    if (!niche.trim()) {
      setMessage("Enter a niche or topic.");
      return;
    }

    setGenerating(true);
    setMessage("");
    setGeneratedIdeas([]);
    setSelectedIdeas([]);

    try {
      const response = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche: niche.trim(),
          audience: audience.trim(),
          length,
          count,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Idea generation failed.",
        );
      }

      const ideas = (result.ideas ?? []) as GeneratedIdea[];

      setGeneratedIdeas(ideas);
      setSelectedIdeas(ideas.map((_, index) => index));
      setMessage(`${ideas.length} ideas generated.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Idea generation failed.",
      );
    } finally {
      setGenerating(false);
    }
  }

  function toggleIdea(index: number) {
    setSelectedIdeas((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  function selectAll() {
    setSelectedIdeas(
      generatedIdeas.map((_, index) => index),
    );
  }

  function clearSelection() {
    setSelectedIdeas([]);
  }

  async function saveSelectedIdeas() {
    if (!selectedChannelId) {
      setMessage("Select a channel first.");
      return;
    }

    const ideasToSave = generatedIdeas.filter((_, index) =>
      selectedIdeas.includes(index),
    );

    if (ideasToSave.length === 0) {
      setMessage("Select at least one idea.");
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setMessage("Supabase variables are missing.");
      return;
    }

    setSaving(true);
    setMessage("");

    const rows = ideasToSave.map((idea) => ({
      channel_id: selectedChannelId,
      topic: idea.topic,
      title: idea.title,
      hook: idea.hook,
      viral_score: idea.viralScore,
      status: "idea",
    }));

    const { error } = await supabase
      .from("ideas")
      .insert(rows);

    if (error) {
      setMessage(`Save error: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage(
      `${rows.length} ideas added to the production board.`,
    );
    setGeneratedIdeas([]);
    setSelectedIdeas([]);

    await onIdeasSaved();
    setSaving(false);
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-medium">
            Generate ideas
          </h2>

          <p className="text-sm text-zinc-400">
            Uses mock generation for now. Later, the same button
            will use OpenAI and trend research.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="block">
          <span className="text-sm font-medium">Channel</span>

          <select
            value={selectedChannelId}
            onChange={(event) =>
              setChannelId(event.target.value)
            }
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
          >
            {channels.length === 0 ? (
              <option value="">No channels available</option>
            ) : (
              channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.title}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Niche</span>

          <input
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            placeholder="AI tools"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Audience</span>

          <input
            value={audience}
            onChange={(event) =>
              setAudience(event.target.value)
            }
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
            placeholder="Beginners"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Length</span>

          <select
            value={length}
            onChange={(event) => setLength(event.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
          >
            <option>15–30 seconds</option>
            <option>30–45 seconds</option>
            <option>45–60 seconds</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">
            Number of ideas
          </span>

          <select
            value={count}
            onChange={(event) =>
              setCount(Number(event.target.value))
            }
            className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={generateIdeas}
        disabled={generating || channels.length === 0}
        className="mt-5 flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}

        {generating ? "Generating..." : "Generate ideas"}
      </button>

      {message && (
        <p className="mt-4 text-sm text-zinc-300">
          {message}
        </p>
      )}

      {generatedIdeas.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-medium">
                Generated ideas
              </h3>

              <p className="text-sm text-zinc-400">
                {selectedIdeas.length} selected
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
              >
                Select all
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={saveSelectedIdeas}
                disabled={saving || selectedIdeas.length === 0}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : `Save selected (${selectedIdeas.length})`}
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {generatedIdeas.map((idea, index) => {
              const selected = selectedIdeas.includes(index);

              return (
                <button
                  key={`${idea.title}-${index}`}
                  type="button"
                  onClick={() => toggleIdea(index)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-white bg-zinc-800"
                      : "border-zinc-800 bg-zinc-950 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-medium">
                      {idea.title}
                    </h4>

                    <span className="rounded-full bg-zinc-900 px-2 py-1 text-xs">
                      {idea.viralScore}/100
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-zinc-400">
                    {idea.hook}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span>{idea.audience}</span>
                    <span>•</span>
                    <span>{idea.targetLength}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}