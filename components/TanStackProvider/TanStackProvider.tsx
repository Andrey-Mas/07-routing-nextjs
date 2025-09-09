"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { useState } from "react";
import axios from "axios";

export default function TanStackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // не дергай зайвий раз при фокусі
            refetchOnWindowFocus: false,
            // обмежити/вимкнути ретраї для 400/404; для 429 дозволимо до 2 спроб
            retry: (failureCount, error) => {
              const status = axios.isAxiosError(error)
                ? error.response?.status
                : undefined;
              if (status === 400 || status === 404) return false;
              if (status === 429) return failureCount < 2;
              // інші тимчасові — можна 2 спроби
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}
