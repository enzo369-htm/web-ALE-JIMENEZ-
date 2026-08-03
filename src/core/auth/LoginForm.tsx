"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../supabase/client";

export type LoginFormProps = {
  /** Default `/admin` */
  redirectTo?: string;
  title?: string;
};

export function LoginForm({
  redirectTo = "/admin",
  title = "Admin",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message || "Invalid credentials");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm px-6 space-y-6"
      >
        <h1 className="text-xl font-medium text-center mb-8">{title}</h1>

        <div>
          <label htmlFor="email" className="block text-sm mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
