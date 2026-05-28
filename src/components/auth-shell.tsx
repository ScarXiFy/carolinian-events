import Link from "next/link";
import { CalendarDays, MapPin, Sparkles, UsersRound } from "lucide-react";

type AuthShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

const previewStats = [
  { label: "Campus events", value: "120+" },
  { label: "Active orgs", value: "28" },
  { label: "Student joins", value: "4.8k" },
];

const previewEvents = [
  {
    title: "CPE Innovation Week",
    meta: "Fri, 9:00 AM",
    icon: CalendarDays,
    tone: "text-[#7bd99d]",
  },
  {
    title: "USC Main Campus",
    meta: "Talamban, Cebu",
    icon: MapPin,
    tone: "text-[#f1d37a]",
  },
  {
    title: "Live attendee tracking",
    meta: "Organizer tools ready",
    icon: UsersRound,
    tone: "text-[#8fb7ff]",
  },
];

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: AuthShellProps) {
  return (
    <main className="legacy-home relative min-h-dvh overflow-hidden bg-[#050505] px-5 py-6 text-white sm:px-8 lg:px-10">
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(42,140,79,0.16),transparent_28%),radial-gradient(circle_at_82%_76%,rgba(212,168,67,0.14),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.06)_0_1px,transparent_1px)] bg-[size:auto,auto,28px_28px] opacity-80"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-3rem)] w-full min-w-0 max-w-6xl items-center gap-8 lg:grid-cols-[minmax(360px,0.82fr)_minmax(460px,1fr)]">
        <section className="mx-auto flex w-full min-w-0 max-w-[calc(100vw-2.5rem)] flex-col gap-6 sm:max-w-[440px]">
          <Link
            href="/"
            className="w-fit text-[1.65rem] font-extrabold leading-none tracking-normal text-white transition hover:text-[#f1d37a] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#d4a843]/35"
            aria-label="Go to Carolinian Events home"
          >
            Carolinian<span className="text-[#d4a843]">Events</span>
          </Link>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d4a843]">
              {eyebrow}
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold leading-tight text-white text-wrap sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-md text-sm leading-6 text-white/64 sm:text-base">
                {description}
              </p>
            </div>
          </div>

          {children}
        </section>

        <aside className="relative hidden min-h-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0f0d]/80 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:block">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(212,168,67,0.24),transparent_28%),radial-gradient(circle_at_24%_82%,rgba(42,140,79,0.28),transparent_32%)]"
            aria-hidden="true"
          />
          <div
            className="absolute -right-24 top-28 h-72 w-72 rounded-full border border-[#d4a843]/20"
            aria-hidden="true"
          />
          <div
            className="absolute -right-36 top-16 h-96 w-96 rounded-full border border-[#2a8c4f]/20"
            aria-hidden="true"
          />

          <div className="relative flex h-full flex-col justify-between">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a843]/25 bg-[#d4a843]/10 px-4 py-2 text-sm font-semibold text-[#f6e6b4]">
                <Sparkles className="size-4" aria-hidden="true" />
                Campus event command center
              </div>
              <div className="max-w-xl space-y-4">
                <h2 className="text-5xl font-extrabold leading-[1.05] tracking-normal text-white">
                  Find the right event before the poster gets lost.
                </h2>
                <p className="text-base leading-7 text-white/62">
                  Sign in to discover campus activities, join events, and manage
                  organizer workflows from one Carolinian dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {previewStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-2xl font-extrabold text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-4 text-white/50">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/24 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold text-white">Next up</p>
                  <p className="text-xs font-semibold text-[#d4a843]">Live</p>
                </div>
                <div className="space-y-3">
                  {previewEvents.map((event) => {
                    const Icon = event.icon;

                    return (
                      <div
                        key={event.title}
                        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3"
                      >
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ${event.tone}`}
                        >
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-white">
                            {event.title}
                          </span>
                          <span className="block text-xs text-white/50">
                            {event.meta}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
