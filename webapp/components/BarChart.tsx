// CSS horizontal bar chart. Counts always shown; percentages only when the
// denominator is 20+, mirroring the analysis rules.

export default function BarChart({
  title, n, nNote, data, labels, alt,
}: {
  title: string;
  n: number;
  nNote?: string;
  data: Record<string, number>;
  labels?: Record<string, string>;
  alt?: boolean;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="chart">
      <div className="title">{title}</div>
      <div className="n-note">{nNote ?? `n = ${n}`}</div>
      {entries.map(([key, val], i) => (
        <div className="bar-row" key={key}>
          <div className="lbl">{labels?.[key] ?? key}</div>
          <div className="bar-track">
            <div
              className={`bar-fill${alt ? " alt" : ""}`}
              style={{
                width: `${(val / max) * 100}%`,
                animationDelay: `${i * 90}ms`,
              }}
            />
          </div>
          <div className="val">
            {val}
            {n >= 20 ? ` (${Math.round((val / n) * 100)}%)` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
