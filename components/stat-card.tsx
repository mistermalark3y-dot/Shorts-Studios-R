type Props = { label: string; value: string; helper: string };

export function StatCard({ label, value, helper }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{helper}</p>
    </div>
  );
}
