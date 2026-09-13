"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TreePine, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await apiRequest<{ access: string; refresh: string; user: any }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      login(data.access, data.refresh, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@familytree.local");
    setPassword("Demo1234!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TreePine className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Family Historical Tree account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="pt-2">
              <button
                type="button"
                onClick={fillDemo}
                className="w-full py-2 px-3 text-xs rounded border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors font-medium text-center"
              >
                Use Seed Demo Account (demo@familytree.local)
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
