import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pager for the history lists (SmartGen, Saved Optimizations).
 *
 * These pages rendered every row they had ever loaded, so a few hundred
 * generations meant a page that scrolled forever and got slower the longer you
 * used the product. Paging is client-side — the lists are already fetched in
 * full, and the endpoints have no offset support to page against.
 *
 * Renders nothing for a single page, so short lists look exactly as before.
 */
export default function HistoryPagination({
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, totalItems);

  // Window of page numbers around the current one — a user with 40 pages
  // shouldn't get 40 buttons.
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btn =
    "h-9 min-w-9 px-3 rounded-[10px] text-sm inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="mx-auto w-full max-w-[1000px] mt-6 flex flex-wrap items-center justify-between gap-3">
      <span className="text-white/60 text-sm">
        Showing {first}–{last} of {totalItems}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${btn} bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className={`${btn} bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white`}
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-white/40">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${
              p === page
                ? "bg-gradient-to-r from-[#FF14EF] to-[#1A73E8] text-white"
                : "bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white"
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-white/40">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className={`${btn} bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btn} bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
