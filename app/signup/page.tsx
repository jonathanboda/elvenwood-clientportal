"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token");
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: inviteToken ? 'client' : 'designer', // Set role based on invite
          },
          emailRedirectTo: inviteToken
            ? `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${inviteToken}`
            : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // Auto-confirm email for development/demo purposes
        if (!data.user.email_confirmed_at) {
          try {
            const confirmResponse = await fetch("/api/auth/confirm-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email }),
            });

            if (confirmResponse.ok) {
              // Email confirmed, now sign in
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (signInError) {
                throw signInError;
              }
            }
          } catch (confirmError) {
            console.warn("Auto-confirmation failed, attempting direct signin:", confirmError);
            // Continue anyway - some Supabase configs don't require confirmation
            try {
              await supabase.auth.signInWithPassword({
                email,
                password,
              });
            } catch (e) {
              // If signin fails too, let the user know
              console.error("Signin after signup failed:", e);
            }
          }
        }

        // If signup was from an invite, redirect back to accept-invite page
        // to complete the invitation flow
        if (inviteToken) {
          setMessage("Account created successfully! Accepting invitation...");
          setTimeout(() => {
            window.location.href = `/accept-invite?token=${inviteToken}`;
          }, 1500);
        } else {
          setMessage("Account created successfully! Redirecting...");
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href={inviteToken ? `/signin?redirect=/accept-invite?token=${inviteToken}` : "/signin"}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
}
