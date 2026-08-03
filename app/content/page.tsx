"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Loader2,
  Plus,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { IdeaGenerator } from "@/components/idea-generator";
type Channel = {
  id: string;
  title: string;
};

type ChannelRelation =
  | {
      title: string;
    }
  | {
      title: string;
    }[]
  | null;

type Idea = {
  id: string;
  channel_id: string | null;
  topic: string;
  title: string;
  hook: string | null;
  viral_score: number;
  status: string;
  created_at: string;
  channels: ChannelRelation;
};

const stages = [
  {
    id: "idea",
    label: "Ideas",
  },
  {
    id: "script",
    label: "Scripts",
  },
  {
    id: "video",
    label: "Videos",
  },
  {
    id: "review",
    label: "Review",
  },
  {
    id: "scheduled",
    label: "Scheduled",
  },
  {
    id: "published",
    label: "Published",
  },
];

export default function ContentPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const [channelId, setChannelId] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [viralScore, setViralScore] = useState(50);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadData() {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setMessage("Supabase environment variables are missing.");
      setLoading(false);
      return;
    }

    setLoading(true);

    const [channelsResult, ideasResult] = await Promise.all([
      supabase
        .from("channels")
        .select("id, title")
        .order("title", { ascending: true }),

      supabase
        .from("ideas")
        .select(`
          id,
          channel_id,
          topic,
          title,
          hook,
          viral_score,
          status,
          created_at,
          channels (
            title
          )
        `)
        .order("created_at", { ascending: false }),
    ]);

    if (channelsResult.error) {
      setMessage(`Channel error: ${channelsResult.error.message}`);
    } else {
      const channelRows = (channelsResult.data ?? []) as Channel[];

      setChannels(channelRows);

      if (!channelId && channelRows.length > 0) {
        setChannelId(channelRows[0].id);
      }
    }

    if (ideasResult.error) {
      setMessage(`Ideas error: ${ideasResult.error.message}`);
    } else {
      setIdeas((ideasResult.data ?? []) as Idea[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!channelId) {
      setMessage("Select a channel.");
      return;
    }

    if (!topic.trim() || !title.trim()) {
      setMessage("Enter both a topic and video title.");
      return;
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      setMessage("Supabase environment variables are missing.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("ideas").insert({
      channel_id: channelId,
      topic: topic.trim(),
      title: title.trim(),
      hook: hook.trim() || null,
      viral_score: viralScore,
      status: "idea",
    });

    if (error) {
      setMessage(`Save error: ${error.message}`);
      setSaving(false);
      return;
    }

    setTopic("");
    setTitle("");
    setHook("");
    setViralScore(50);
    setMessage("Idea added to the production board.");

    await loadData();
    setSaving(false);
  }

  async function moveIdea(idea: Idea, direction: "back" | "forward") {
    const currentIndex = stages.findIndex(
      (stage) => stage.id === idea.status,
    );

    if (currentIndex === -1) return;

    const nextIndex =
      direction === "forward"
        ? currentIndex + 1
        : currentIndex - 1;

    const nextStage = stages[nextIndex];

    if (!nextStage) return;

    const supabase = getSupabaseClient();

    if (!supabase) {
      setMessage("Supabase environment variables are missing.");
      return;
    }

    setMovingId(idea.id);
    setMessage("");

    const { error } = await supabase
      .from("ideas")
      .update({
        status: nextStage.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idea.id);

    if (error) {
      setMessage(`Move error: ${error.message}`);
      setMovingId(null);
      return;
    }

    setIdeas((currentIdeas) =>
      currentIdeas.map((currentIdea) =>
        currentIdea.id === idea.id
          ? {
              ...currentIdea,
              status: nextStage.id,
            }
          : currentIdea,
      ),
    );

    setMovingId(null);
  }

  function getChannelName(relation: ChannelRelation) {
    if (Array.isArray(relation)) {
      return relation[0]?.title ?? "No channel";
    }

    return relation?.title ?? "No channel";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            Move every Short from idea to publication
          </p>

          <h1 className="text-3xl font-semibold">
            Production board
          </h1>
        </div>

        <div className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
          {ideas.length} total projects
        </div>
      </div>
      <IdeaGenerator
  channels={channels}
  onIdeasSaved={loadData}
/>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Plus className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-medium">
              Add a new idea
            </h2>

            <p className="text-sm text-zinc-400">
              AI-generated ideas will enter through this same workflow later.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 lg:grid-cols-2"
        >
          <label className="block">
            <span className="text-sm font-medium">Channel</span>

            <select
              value={channelId}
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
            <span className="text-sm font-medium">Topic</span>

            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
              placeholder="Example: AI tools for job seekers"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium">
              Video title
            </span>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
              placeholder="Example: 3 free AI tools that can help you get hired"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium">
              Opening hook
            </span>

            <textarea
              value={hook}
              onChange={(event) => setHook(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3"
              placeholder="Example: Stop applying for jobs until you try these three tools."
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="flex items-center justify-between text-sm font-medium">
              <span>Idea score</span>
              <span>{viralScore}/100</span>
            </span>

            <input
              type="range"
              min="0"
              max="100"
              value={viralScore}
              onChange={(event) =>
                setViralScore(Number(event.target.value))
              }
              className="mt-3 w-full"
            />
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={saving || channels.length === 0}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}

              {saving ? "Saving..." : "Add to board"}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-sm text-zinc-300">
            {message}
          </p>
        )}
      </section>

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          Loading production board...
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
          {stages.map((stage, stageIndex) => {
            const stageIdeas = ideas.filter(
              (idea) => idea.status === stage.id,
            );

            return (
              <div
                key={stage.id}
                className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-medium">{stage.label}</h2>

                  <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                    {stageIdeas.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageIdeas.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
                      Empty
                    </div>
                  ) : (
                    stageIdeas.map((idea) => (
                      <article
                        key={idea.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                      >
                        <p className="text-xs text-zinc-500">
                          {getChannelName(idea.channels)}
                        </p>

                        <h3 className="mt-1 text-sm font-medium">
                          {idea.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-xs text-zinc-400">
                          {idea.hook || idea.topic}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-zinc-500">
                            Score
                          </span>

                          <span className="text-sm font-medium">
                            {idea.viral_score}/100
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              moveIdea(idea, "back")
                            }
                            disabled={
                              stageIndex === 0 ||
                              movingId === idea.id
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Move ${idea.title} backward`}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>

                          {movingId === idea.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              moveIdea(idea, "forward")
                            }
                            disabled={
                              stageIndex === stages.length - 1 ||
                              movingId === idea.id
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Move ${idea.title} forward`}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}