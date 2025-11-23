import { getCurrentUser } from "@/app/api";
import { useEffect, useState } from "react";
import { isLoggedIn, logout } from "@/utils/auth";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "@/types/user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoggedIn()) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (response.success) {
          setUser(response.data);
        } else {
          logout();
          navigate({ to: "/auth/login" });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        logout();
        navigate({ to: "/auth/login" });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return { user, loading, refreshUser };
};
