export default function SchedulePage() {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-zinc-400">
            Plan and manage upcoming uploads
          </p>
          <h1 className="text-3xl font-semibold">Schedule</h1>
        </div>
  
        <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
          <h2 className="text-xl font-medium">Nothing scheduled yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Approved videos will be placed on the publishing calendar here.
          </p>
        </div>
      </div>
    );
  }