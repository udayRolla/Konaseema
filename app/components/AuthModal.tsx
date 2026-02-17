"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setMsg(null);
      setLoading(false);
      setMode("login");
      setEmail("");
      setPassword("");
      setFullName("");
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    setMsg(null);
    setLoading(true);

    if (mode === "login") {
      const r = await signIn(email, password);
      setLoading(false);
      if (!r.ok) return setMsg(r.error || "Login failed");
      onClose();
      return;
    }

    const r = await signUp({ email, password, fullName });
    setLoading(false);
    if (!r.ok) return setMsg(r.error || "Signup failed");
    setMsg("Account created. Please login.");
    setMode("login");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />

      {/* card */}
      <div className="relative w-[92%] max-w-[560px] bg-[#fffaf2] rounded-2xl border border-[#e8dccb] shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#e8dccb]">
          <h3 className="text-xl font-semibold">
            {mode === "login" ? "Login" : "Sign up"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* body */}
        <div className="px-7 pt-6 pb-7">
          {mode === "signup" && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full px-5 py-4 rounded-2xl border border-[#d9c4a7] bg-white focus:outline-none mb-4 text-[16px]"
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-5 py-4 rounded-2xl border border-[#d9c4a7] bg-white focus:outline-none mb-4 text-[16px]"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-5 py-4 rounded-2xl border border-[#d9c4a7] bg-white focus:outline-none mb-5 text-[16px]"
          />

          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="w-full py-3 rounded-xl border border-[#d9c4a7] bg-[#fffaf2] hover:bg-[#f6efe6] transition font-semibold"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>

          {msg && <div className="mt-3 text-sm opacity-80 text-center">{msg}</div>}

          <div className="mt-4 text-sm text-center opacity-80">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already a member?{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
