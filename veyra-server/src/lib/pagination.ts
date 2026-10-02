/** Pagination helpers for list endpoints. */
import { PAGINATION } from '../config/constants.js';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function parsePagination(query: { page?: string; limit?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || String(PAGINATION.DEFAULT_PAGE), 10));
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit || String(PAGINATION.DEFAULT_LIMIT), 10)),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function paginate<T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}
