"use client";

import React from "react";
import Link from "next/link";
import { TreePine, Users, BookOpen, Shield, Sparkles, ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-border bg-gradient-to-b from-secondary/40 to-background">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/60 border border-accent text-accent-foreground text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Modern Genealogical Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-serif">
            Preserve Your Heritage. <br className="hidden sm:inline" />
            <span className="text-primary">Explore Every Generation.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            Construct rich, interactive family trees that faithfully record multi-generational lineages,
            blended families, matrimonial histories, life milestone timelines, and oral memories.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="gap-2 shadow-md">
                Launch Application
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Engineered for Real-World Families
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Beyond rigid binary trees. Capture the true diversity and complexity of human history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card/60 hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TreePine className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Graph-Powered Tree</h3>
              <p className="text-sm text-muted-foreground">
                Powered by React Flow with custom person cards, multi-partnership lines, generation depth
                controls, and instant pan-to-person search.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Stories & Oral History</h3>
              <p className="text-sm text-muted-foreground">
                Record treasured family memories, migration tales, and photographs linked to individuals and
                ancestral villages.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Living Privacy & RBAC</h3>
              <p className="text-sm text-muted-foreground">
                Strict permissions protecting living family members, with roles for owners, editors, and
                read-only viewers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 text-center text-xs text-muted-foreground bg-card">
        <p>© 2026 Family Historical Tree. All rights reserved.</p>
      </footer>
    </div>
  );
}
