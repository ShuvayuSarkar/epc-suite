import { useState } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
  });

  const onPageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const onPageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  const setTotal = (total: number) => {
    setPagination((prev) => ({ ...prev, total }));
  };

  return {
    ...pagination,
    onPageChange,
    onPageSizeChange,
    setTotal,
  };
}
