import { getCurrentUser } from "@/app/api";
import type { User } from "@/types/api";
import { useEffect, useState } from "react";
import { isLoggedIn, logout } from "@/utils/auth";
import { useNavigate } from "@tanstack/react-router";

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

      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          console.error("Error parsing cached user:", e);
        }
      }

      try {
        const response = await getCurrentUser();
        if (response.success) {
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
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
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return { user, loading, refreshUser };
};
