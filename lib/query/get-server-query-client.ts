import { cache } from "react";

import { makeQueryClient } from "@/lib/query/make-query-client";

/**
 * One QueryClient per React server request (deduped by `cache`).
 * Use in Server Components / Route Handlers when prefetching with `queryClient.prefetchQuery`,
 * then pass dehydrated state through `<HydrationBoundary>` to the client subtree.
 */
export const getServerQueryClient = cache(makeQueryClient);
