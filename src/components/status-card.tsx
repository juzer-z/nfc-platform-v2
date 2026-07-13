export function StatusCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/6 p-6 text-white/85 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/65">{body}</p>
    </div>
  );
}
