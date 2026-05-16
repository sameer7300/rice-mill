import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, total, limit, onChange }: PaginationProps) {
  if (pages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPages = () => {
    const arr = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) arr.push(i);
    } else {
      arr.push(1);
      if (page > 3) arr.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) arr.push(i);
      if (page < pages - 2) arr.push('...');
      arr.push(pages);
    }
    return arr;
  };

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-gray-500">Showing {from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
          <ChevronLeft size={16} />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={i} className="px-2 text-gray-400">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p as number)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-green-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === pages}
          className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
