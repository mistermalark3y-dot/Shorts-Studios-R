export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-400">Ideas, scripts, renders and approvals</p>
        <h1 className="text-3xl font-semibold">Content</h1>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <label className="block text-sm font-medium" htmlFor="topic">New video topic</label>
        <textarea id="topic" className="mt-2 min-h-32 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3" placeholder="Example: Three useful AI tools for job seekers" />
        <button type="button" className="mt-3 rounded-lg bg-white px-4 py-2 font-medium text-black">Create draft job</button>
      </div>
    </div>
  );
}
