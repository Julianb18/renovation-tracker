import { useNavigate } from "react-router-dom";
import type { Category, Project } from "../store";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

type Props = {
  project: Project;
  categories: Category[];
  onDelete: (categoryId: string) => void;
};

export function CategoryProgressList({ project, categories, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {categories.map((category) => {
        const catTotals = getCategoryTotals(category);
        const committedPct =
          catTotals.committed === 0
            ? 0
            : Math.min(
                100,
                Math.round((catTotals.committed / project.totalBudget) * 100),
              );
        const paidPct =
          catTotals.committed === 0
            ? 0
            : Math.min(
                100,
                Math.round((catTotals.paid / catTotals.committed) * 100),
              );
        return (
          <div
            key={`${category.id}-row`}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/category/${category.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/category/${category.id}`);
              }
            }}
            className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-indigo-300/40 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${category.gradient} text-lg`}
                >
                  {category.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {category.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    Committed {currency(catTotals.committed)} • Paid{" "}
                    {currency(catTotals.paid)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const ok = window.confirm(
                    `Delete category "${category.name}"? This will remove its items.`,
                  );
                  if (ok) onDelete(category.id);
                }}
                className="text-xs font-semibold text-rose-200 decoration-rose-400/70"
              >
                Delete
              </button>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${category.gradient}`}
                style={{ width: `${committedPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Paid {paidPct}%</span>
              <span>Remaining {currency(catTotals.remaining)}</span>
            </div>
            <p className="text-xs font-semibold text-indigo-200/90 opacity-0 transition group-hover:opacity-100">
              Click to open category →
            </p>
          </div>
        );
      })}
    </div>
  );
}

function getCategoryTotals(category: Category) {
  const committed = category.items.reduce((s, i) => s + i.amount, 0);
  const paid = category.items
    .filter((i) => i.status === "Paid")
    .reduce((s, i) => s + i.amount, 0);
  return { committed, paid, remaining: committed - paid };
}
