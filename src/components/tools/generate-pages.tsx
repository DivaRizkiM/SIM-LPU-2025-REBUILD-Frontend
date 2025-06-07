import { PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination";

export const generatePaginationLinks = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) => {
  const pages: JSX.Element[] = [];
  const pageNeighbours = 2;

  // Handle case when there is only one page
  if (totalPages <= 1) {
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => onPageChange(1)}
          isActive={1 === currentPage}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    return pages;
  }

  const startPage = Math.max(2, currentPage - pageNeighbours); // Mulai dari halaman 2 untuk menghindari duplikasi halaman pertama
  const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours); // Berakhir di halaman totalPages - 1 untuk menghindari duplikasi halaman terakhir

  // Halaman pertama selalu ada
  pages.push(
    <PaginationItem key={1}>
      <PaginationLink
        onClick={() => onPageChange(1)}
        isActive={1 === currentPage}
      >
        1
      </PaginationLink>
    </PaginationItem>
  );

  if (startPage > 2) {
    pages.push(<PaginationEllipsis key="start-ellipsis" />);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <PaginationItem key={i}>
        <PaginationLink
          onClick={() => onPageChange(i)}
          isActive={i === currentPage}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  if (endPage < totalPages - 1) {
    pages.push(<PaginationEllipsis key="end-ellipsis" />);
  }

  // Halaman terakhir selalu ada
  pages.push(
    <PaginationItem key={totalPages}>
      <PaginationLink
        onClick={() => onPageChange(totalPages)}
        isActive={totalPages === currentPage}
      >
        {totalPages}
      </PaginationLink>
    </PaginationItem>
  );

  return pages;
};
