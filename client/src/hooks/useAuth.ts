import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthUser {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async (): Promise<AuthUser | null> => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          return await response.json();
        }
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error(`Auth check failed: ${response.status}`);
      } catch (error) {
        console.log("Auth check failed:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.log("Logout request failed:", error);
    } finally {
      // Clear auth cache regardless of API response
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      window.location.href = "/login";
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
  };
}