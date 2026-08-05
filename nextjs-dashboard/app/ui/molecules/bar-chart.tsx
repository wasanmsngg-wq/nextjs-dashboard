import { designTokens } from "@/app/ui/theme";

export type BarChartPoint = {
  label: string;
  value: number;
  formattedValue: string;
};

export function BarChart({
  title,
  titleId,
  descriptionId,
  points,
}: {
  title: string;
  titleId: string;
  descriptionId: string;
  points: BarChartPoint[];
}) {
  const maximum = Math.max(...points.map((point) => point.value), 0);
  return (
    <figure aria-describedby={descriptionId} aria-labelledby={titleId}>
      <h3 id={titleId} className="font-bold text-slate-950">
        {title}
      </h3>
      <div
        aria-label={title}
        className="mt-4 overflow-x-auto pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        role="region"
        tabIndex={0}
      >
        <ol
          aria-hidden="true"
          className="flex h-56 items-end gap-3 border-b border-slate-300"
          style={{ minWidth: Math.max(320, points.length * 72) }}
        >
          {points.map((point) => {
            const height = maximum ? (point.value / maximum) * 144 : 0;
            return (
              <li
                key={point.label}
                className="flex min-w-14 flex-1 flex-col items-center justify-end"
              >
                <span className="mb-1 text-xs font-semibold text-slate-700">
                  {point.formattedValue}
                </span>
                <span
                  className="w-full max-w-12"
                  style={{
                    backgroundColor: designTokens.color.brand,
                    borderRadius: `${designTokens.radius.control}px ${designTokens.radius.control}px 0 0`,
                    height: `${height}px`,
                    minHeight: point.value > 0 ? "4px" : "0",
                  }}
                />
                <span className="mt-2 whitespace-nowrap text-xs text-slate-600">
                  {point.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}
