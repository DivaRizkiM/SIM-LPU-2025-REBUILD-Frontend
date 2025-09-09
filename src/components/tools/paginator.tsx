import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { generatePaginationLinks } from "./generate-pages";
import { motion } from "framer-motion";
import SkeletonLoading from "./SkeletonPagination";

type PaginatorProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  showPreviousNext: boolean;
  isLoading?: boolean;
}

export default function Paginator({
  currentPage,
  totalPages,
  onPageChange,
  showPreviousNext,
  isLoading = false
}: PaginatorProps) {

if (isLoading) {
    return <SkeletonLoading/>;
}
  return (
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1}}
>
        <Pagination>
        <PaginationContent>
            {showPreviousNext ? (
            <PaginationItem>
                <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage - 1 < 1}
                className={currentPage - 1 < 1 ? 'opacity-45' : ''}
                />
            </PaginationItem>
            ) : null}
            {generatePaginationLinks(currentPage, totalPages, onPageChange)}
            {showPreviousNext ? (
            <PaginationItem>
                <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage > totalPages - 1}
                className={currentPage > totalPages - 1 ? 'opacity-45' : ''}
                />
            </PaginationItem>
            ): null}
        </PaginationContent>
        </Pagination>
    </motion.div>
  )
}