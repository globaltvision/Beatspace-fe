import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // data stays fresh for 5 minutes — no refetch on nav
      gcTime: 10 * 60 * 1000,          // keep unused data in memory for 10 minutes
      refetchOnWindowFocus: false,      // switching browser tabs won't trigger refetch
      refetchOnReconnect: true,         // refetch when network comes back
      retry: 1,
    },
  },
});

const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default QueryProvider;
