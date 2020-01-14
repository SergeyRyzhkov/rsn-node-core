
export default interface SortFilterPagination {
    sort?: {
        sortField?: string;
        sortType?: string;

    };
    pagination?: {
        offset?: number,
        limit?: number,
    };
}

