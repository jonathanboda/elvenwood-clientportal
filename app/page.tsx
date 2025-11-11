"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Elvenwood Interiors
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100">
          Collaborate on interior design projects with clients and designers
        </p>

        <div className="space-y-4 mb-12">
          <p className="text-lg text-blue-100">
            Welcome to the design collaboration platform. Sign in or create an account to get started.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signin"
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-blue-400 border-opacity-30">
          <h2 className="text-2xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-4">📐</div>
              <h3 className="text-xl font-semibold mb-2">Design Projects</h3>
              <p className="text-blue-100">
                Manage and organize design projects with version control
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Client Collaboration</h3>
              <p className="text-blue-100">
                Invite clients and get feedback on designs
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Comments & Feedback</h3>
              <p className="text-blue-100">
                Threaded comments and feedback for each design version
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
