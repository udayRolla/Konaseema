"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
};

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (input: SignUpInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (emailRaw: string, password: string) => {
    const email = emailRaw.trim();
    if (!email) return { ok: false, error: "Email is required" };
    if (!password) return { ok: false, error: "Password is required" };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };

    return { ok: true };
  };

  const signUp = async ({ email: emailRaw, password, fullName }: SignUpInput) => {
    const email = emailRaw.trim();
    const name = fullName.trim();

    if (!email) return { ok: false, error: "Email is required" };
    if (!password || password.length < 6)
      return { ok: false, error: "Password must be at least 6 characters" };
    if (!name) return { ok: false, error: "Full name is required" };

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, error: error.message };

    // SQL storage later (profiles / addresses / orders)
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
