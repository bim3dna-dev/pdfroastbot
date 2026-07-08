import type { RoastIssue, RoastReport } from "@/lib/types";

type RoastReportProps = {
  report: RoastReport;
};

const severityClasses: Record<RoastIssue["severity"], string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-800"
};

export function RoastReport({ report }: RoastReportProps) {
  return (
    <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ember">
          Roast report
        </p>
        <h2 className="text-2xl font-bold text-stone-950">Your PDF survived. Barely.</h2>
        <p className="max-w-3xl text-stone-700">{report.summary}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(report.scores).map(([label, score]) => (
          <div key={label} className="rounded-md border border-stone-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="capitalize text-stone-700">{label}</p>
              <p className="text-xl font-bold text-stone-950">{score}</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-stone-100">
              <div
                className="h-2 rounded-full bg-ember"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {report.issues.map((issue) => (
          <article key={issue.title} className="rounded-md border border-stone-200 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-stone-950">{issue.title}</h3>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${severityClasses[issue.severity]}`}
              >
                {issue.severity}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-stone-800">Problem</p>
            <p className="mt-1 text-stone-700">{issue.problem}</p>
            <p className="mt-3 text-sm font-semibold text-stone-800">Fix</p>
            <p className="mt-1 text-stone-700">{issue.fix}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-md border border-ember/20 bg-orange-50 p-4">
        <p className="text-sm font-semibold text-ember">Suggested next step</p>
        <p className="mt-1 text-stone-800">{report.suggestedNextStep}</p>
      </div>
    </section>
  );
}
