export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-400">Credentials and integrations</p>
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-medium">Setup status</h2>
        <ul className="mt-4 space-y-3 text-zinc-300">
          <li>○ Supabase database</li>
          <li>○ Google OAuth</li>
          <li>○ OpenAI API</li>
          <li>○ Video rendering service</li>
        </ul>
      </div>
    </div>
  );
}
