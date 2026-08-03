export default function ScriptsPage() {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-zinc-400">
            Turn approved ideas into finished Shorts scripts
          </p>
          <h1 className="text-3xl font-semibold">Scripts</h1>
        </div>
  
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
          <h2 className="text-xl font-medium">No scripts yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Approved ideas will appear here when we add script generation.
          </p>
        </div>
      </div>
    );
  }