"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../api";
import type { Profile } from "../types/database";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (data: any) => Promise<{ error: any; emailConfirm: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  updateAvatar: (file: File) => Promise<{ url: string | null; error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchSession = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await api.get<{ user: User; profile: Profile }>(
        "/auth/me",
      );

      if (!error && data) {
        setUser(data.user);
        setProfile(data.profile);
      } else {
        localStorage.removeItem("auth_token");
      }
    } catch (err) {
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initializedRef.current) return;
    fetchSession();
    initializedRef.current = true;
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await api.post<{
      token: string;
      user: User;
      profile: Profile;
    }>("/auth/login", {
      email,
      password,
    });
    if (!error && data) {
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      setProfile(data.profile);
    }
    return { error };
  };

  const signUp = async (data: any) => {
    const response = await api.post<{ emailConfirm: boolean }>(
      "/auth/register",
      data,
    );
    return {
      error: response.error,
      emailConfirm: response.data?.emailConfirm || false,
    };
  };

  const signOut = async () => {
    await api.post("/auth/logout", {});
    localStorage.removeItem("auth_token");
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const response = await api.put<Profile>("/profile", data);
    if (!response.error && response.data) {
      setProfile(response.data);
    }
    return { error: response.error };
  };

  const updateAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";
      const response = await fetch(`${baseUrl}/profile/avatar`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProfile((prev) => (prev ? { ...prev, avatar_url: data.url } : null));
      return { url: data.url, error: null };
    } catch (error) {
      return { url: null, error };
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
