"use client";

import { DefaultOptions, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import qs from "qs";
import { ReactNode } from "react";

import { client } from "@/api/client.gen";
import { UserStoreProvider } from "@/store/user/user-store-provider";

const queryClientConfig: DefaultOptions<Error> = {
  queries: {
    // Multiple calls to the same query might actually fire the GET request multiple times
    // since it thinks it is a stale value. This is a workaround to prevent that.
    // If this value proves too high (stale values getting shown), we can try to lower it.
    // TODO: if https://github.com/uniconhq/backend/issues/125 is fixed, consider lowering this to 1000
    staleTime: 3000,
    retry: (failureCount, error) => {
      // Do not retry on 4xx errors
      if (error instanceof AxiosError && error.response?.status && error.response?.status) {
        const statusCode = error.response?.status;
        if (statusCode >= 400 && statusCode < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
  },
};
const queryClient = new QueryClient({ defaultOptions: queryClientConfig });

export function StoreProvider({ children }: { children: ReactNode }) {
  client.setConfig({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    paramsSerializer: (params) => {
      return qs.stringify(params, { indices: false });
    },
    throwOnError: true,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <UserStoreProvider>{children}</UserStoreProvider>
    </QueryClientProvider>
  );
}
