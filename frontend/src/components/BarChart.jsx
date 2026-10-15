// stacked bars without a chart library: one column per bucket, `accepted` on top of `rejected`
function BarChart({ data, height = 120 }) {
  const max = Math.max(1, ...data.map((d) => d.accepted + d.rejected));

  return (
    <div className="flex items-end gap-2" style={{ height }} role="img" aria-label="Interviews per week">
      {data.map((bucket) => {
        const total = bucket.accepted + bucket.rejected;
        const column = (total / max) * 100;

        return (
          <div
            key={bucket.label}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
            title={`${bucket.label}: ${total} interview${total === 1 ? "" : "s"} (${bucket.accepted} accepted)`}
          >
            <span className="font-mono text-[0.65rem] text-base-content/50 opacity-0 transition-opacity group-hover:opacity-100">
              {total}
            </span>

            <div
              className="flex w-full flex-col justify-end overflow-hidden rounded-t-md bg-base-content/5"
              style={{ height: `${Math.max(column, total ? 6 : 2)}%` }}
            >
              <div
                className="bg-error/70"
                style={{ height: total ? `${(bucket.rejected / total) * 100}%` : 0 }}
              />
              <div
                className="bg-success/80"
                style={{ height: total ? `${(bucket.accepted / total) * 100}%` : 0 }}
              />
            </div>

            <span className="font-mono text-[0.65rem] text-base-content/50">{bucket.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default BarChart;
