
export type SortPagination = {
  sort?: {
    sortField?: string;
    sortType?: string;

  };
  pagination?: {
    offset?: number,
    limit?: number,
  };
}


