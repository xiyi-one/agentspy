import { useEffect, useState } from "react";

interface ResourceState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useApiResource<T>(loader: () => Promise<T>, dependencies: readonly unknown[]) {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, isLoading: true });

  useEffect(() => {
    let ignore = false;

    setState((current) => ({ ...current, error: null, isLoading: true }));
    loader()
      .then((data) => {
        if (!ignore) setState({ data, error: null, isLoading: false });
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setState({ data: null, error: error instanceof Error ? error.message : "Unable to load backend data", isLoading: false });
        }
      });

    return () => {
      ignore = true;
    };
  }, dependencies);

  return state;
}
