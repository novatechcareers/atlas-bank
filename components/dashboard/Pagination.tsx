type PaginationProps = {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, pageCount, onPageChange }: PaginationProps) {
  return (
    <div className="pagination" aria-label="Pagination">
      <button
        className="pagination-btn"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <div className="pagination-pages">
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            key={index}
            className={`pagination-page ${currentPage === index + 1 ? "active" : ""}`}
            type="button"
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <button
        className="pagination-btn"
        type="button"
        disabled={currentPage === pageCount}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
