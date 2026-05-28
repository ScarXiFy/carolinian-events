import Link from "next/link";

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: AuthShellProps) {
  return (
    <main className="legacy-home relative min-h-dvh overflow-hidden bg-[#050505] px-5 py-6 text-white sm:px-8">
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(42,140,79,0.16),transparent_28%),radial-gradient(circle_at_82%_76%,rgba(212,168,67,0.14),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.06)_0_1px,transparent_1px)] bg-[size:auto,auto,28px_28px] opacity-80"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full min-w-0 max-w-[460px] items-center justify-center">
        <section className="flex w-full min-w-0 flex-col gap-6">
          <Link
            href="/"
            className="mx-auto w-fit text-[1.65rem] font-extrabold leading-none tracking-normal text-white transition hover:text-[#f1d37a] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#d4a843]/35"
            aria-label="Go to Carolinian Events home"
          >
            Carolinian<span className="text-[#d4a843]">Events</span>
          </Link>

          <div className="space-y-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d4a843]">
              {eyebrow}
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold leading-tight text-white text-wrap sm:text-4xl">
                {title}
              </h1>
              <p className="mx-auto max-w-md text-sm leading-6 text-white/64 sm:text-base">
                {description}
              </p>
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}
