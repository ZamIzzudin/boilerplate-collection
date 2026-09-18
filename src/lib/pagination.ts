export type Pagination = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

export const getPagination = (
  page = 1,
  limit = 15,
  maxLimit = 1000,
): Pagination => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(maxLimit, Math.max(1, Number(limit) || 15));

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
};
