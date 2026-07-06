import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange, siblings = 1 }) {
  if (totalPages <= 1) return null;

  const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const getPages = () => {
    const total = totalPages;
    const current = currentPage;
    const sib = siblings;

    const startPages = range(1, Math.min(2, total));
    const endPages = range(Math.max(total - 1, 3), total);

    const midStart = Math.max(current - sib, 3);
    const midEnd = Math.min(current + sib, total - 2);
    const midPages = midStart <= midEnd ? range(midStart, midEnd) : [];

    const pages = [];
    const addPage = (p) => { if (!pages.includes(p)) pages.push(p); };
    const addEllipsis = () => { if (pages[pages.length - 1] !== '...') pages.push('...'); };

    startPages.forEach(addPage);
    if (midStart > 3) addEllipsis();
    midPages.forEach(addPage);
    if (midEnd < total - 2) addEllipsis();
    endPages.forEach(addPage);

    return pages;
  };

  const pages = getPages();

  const btnBase = {
    background: 'none',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    color: '#aaa',
    cursor: 'pointer',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '500',
    minWidth: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s'
  };

  const activeBtn = {
    ...btnBase,
    background: '#fff',
    color: '#000',
    borderColor: '#fff'
  };

  return (
    <nav aria-label="Pagination" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', padding: '16px 0' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        style={{ ...btnBase, opacity: currentPage <= 1 ? 0.4 : 1, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ color: '#555', fontSize: '12px', padding: '0 2px' }}>...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={`Page ${p}`}
            style={p === currentPage ? activeBtn : btnBase}
            onMouseEnter={e => { if (p !== currentPage) e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={e => { if (p !== currentPage) e.currentTarget.style.borderColor = '#2a2a2a'; }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        style={{ ...btnBase, opacity: currentPage >= totalPages ? 0.4 : 1, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
