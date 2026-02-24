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

/* 🔥 Safe timeout wrapper */
function withTimeout<T>(promise: Promise<T>, ms = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timed out")), ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let alive = true;

    // ✅ FIX: use getSession (NOT getUser)
    withTimeout(supabase.auth.getSession(), 12000)
      .then(({ data }) => {
        if (!alive) return;
        setUser(data.session?.user ?? null);
      })
      .catch(() => {
        if (!alive) return;
        setUser(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (emailRaw: string, password: string) => {
    const email = emailRaw.trim();

    if (!email) return { ok: false, error: "Email is required" };
    if (!password) return { ok: false, error: "Password is required" };

    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        12000
      );

      if (error) return { ok: false, error: error.message };

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Login failed" };
    }
  };

  const signUp = async ({ email: emailRaw, password, fullName }: SignUpInput) => {
    const email = emailRaw.trim();
    const name = fullName.trim();

    if (!email) return { ok: false, error: "Email is required" };
    if (!password || password.length < 6)
      return { ok: false, error: "Password must be at least 6 characters" };
    if (!name) return { ok: false, error: "Full name is required" };

    try {
      const { error } = await withTimeout(
        supabase.auth.signUp({ email, password }),
        12000
      );

      if (error) return { ok: false, error: error.message };

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Signup failed" };
    }
  };

  const logout = async () => {
    try {
      await withTimeout(supabase.auth.signOut(), 12000);
    } catch {
      // ignore
    }
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
