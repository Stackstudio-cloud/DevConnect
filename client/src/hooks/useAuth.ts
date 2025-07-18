import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If we get a 401 error, user is not authenticated but loading is complete
  const isUnauthenticated = error && (error as any).message?.includes('401');

  return {
    user,
    isLoading: isLoading && !isUnauthenticated,
    isAuthenticated: !!user && !isUnauthenticated,
  };
}
