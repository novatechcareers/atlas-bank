type PaginationProps = {
  currentPage?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
};

export default function Pagination({ currentPage = 1, pageCount = 1, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: Math.max(1, pageCount) }, (_, index) => index + 1);

  return (
    <div className="pagination" aria-label="Pagination">
      <button className="pagination-btn" type="button" onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}>
        Previous
      </button>
      <div className="pagination-pages">
        {pages.map((page) => (
          <button
            key={page}
            className={`pagination-page ${page === currentPage ? "active" : ""}`.trim()}
            type="button"
            onClick={() => onPageChange?.(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <button className="pagination-btn" type="button" onClick={() => onPageChange?.(Math.min(pageCount, currentPage + 1))}>
        Next
      </button>
    </div>
  );
}
