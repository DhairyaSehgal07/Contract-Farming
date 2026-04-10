import { queryOptions } from "@tanstack/react-query";

import type { OrganizationListItem } from "@/lib/data/organizations";
import { queryFetchEnvelopeData } from "@/lib/query/http";
import { queryKeys } from "@/lib/query/query-keys";

/**
 * Shared options for `useQuery`, `prefetchQuery`, and `useSuspenseQuery`.
 * Keeps keys and fetch logic aligned across client and (future) RSC prefetch.
 */
export function organizationsListQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.organizations.lists(),
    queryFn: () =>
      queryFetchEnvelopeData<OrganizationListItem[]>("/api/organisation"),
  });
}
