export default function VideosPage() {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-zinc-400">
            Voiceovers, scenes, captions and rendered drafts
          </p>
          <h1 className="text-3xl font-semibold">Videos</h1>
        </div>
  
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
          <h2 className="text-xl font-medium">No videos in production</h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Generated video drafts will appear here for your approval.
          </p>
        </div>
      </div>
    );
  }