"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  TreePine,
  Users,
  BookOpen,
  Shield,
  Sparkles,
  ArrowRight,
  Globe,
  Image as ImageIcon,
  Compass,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Family } from "@/types";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  const { data: publicFamiliesData, isLoading } = useQuery<{ results: Family[] }>({
    queryKey: ["public-families"],
    queryFn: () => apiRequest<{ results: Family[] }>("/families/"),
  });

  const publicFamilies = publicFamiliesData?.results || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-border bg-gradient-to-b from-secondary/40 to-background">
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

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 shadow-md">
                    <TreePine className="h-5 w-5" />
                    ड्यासबोर्ड (Go to Dashboard)
                  </Button>
                </Link>
                <a href="#public-gallery">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Globe className="h-5 w-5 text-emerald-600" />
                    सार्वजनिक वंशावली ग्यालरी
                  </Button>
                </a>
              </>
            ) : (
              <>
                <a href="#public-gallery">
                  <Button size="lg" className="gap-2 shadow-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                    <Globe className="h-5 w-5" />
                    सार्वजनिक वंशावली हेर्नुहोस् (Explore Public Trees)
                  </Button>
                </a>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign In / लगइन गर्नुहोस्
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Public Family Gallery Section */}
      <section id="public-gallery" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-b border-border scroll-mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide uppercase">
              <Globe className="h-3.5 w-3.5" />
              खुला वंशावली अभिलेख (Open Lineages)
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
              सार्वजनिक वंशावली ग्यालरी (Public Lineage Gallery)
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              लगइन नगरीकन जोसुकैले पनि हेर्न मिल्ने गरी सार्वजनिक गरिएका ऐतिहासिक कुल वंशावली, तस्विर तथा पुर्खाको इतिहास।
            </p>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-md border border-border">
            {isLoading ? "लोड हुँदैछ..." : `${publicFamilies.length} सार्वजनिक कुल उपलब्ध`}
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
            सार्वजनिक वंशावलीहरू लोड हुँदैछ...
          </div>
        ) : publicFamilies.length === 0 ? (
          <Card className="border-dashed border-2 border-border p-12 text-center space-y-3">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg text-foreground">कुनै सार्वजनिक वंशावली भेटिएन</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              अहिले कुनै पनि वंशावलीलाई सार्वजनिक गरिएको छैन। लगइन गरी आफ्नै वंशावली निर्माण गर्नुहोस्।
            </p>
            <Link href="/register">
              <Button>खाता खोल्नुहोस् (Register)</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicFamilies.map((fam) => (
              <Card
                key={fam.id}
                className="overflow-hidden border-border bg-card hover:shadow-xl hover:border-primary/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Cover Image or Decorative Top */}
                  <div className="h-48 w-full relative bg-muted overflow-hidden">
                    {fam.cover_image ? (
                      <img
                        src={fam.cover_image}
                        alt={fam.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-800/80 to-slate-900 flex items-center justify-center text-white/40">
                        <TreePine className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-600/90 text-white px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs">
                        <Globe className="h-3 w-3" />
                        सार्वजनिक (Public)
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-xl font-bold text-white font-serif drop-shadow-sm line-clamp-1 group-hover:text-emerald-200 transition-colors">
                        {fam.name}
                      </h3>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">
                      {fam.description || "दोलखा तथा नेपालका विभिन्न भूभागमा विस्तारित ऐतिहासिक वंशावली।"}
                    </p>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border text-xs">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-secondary text-secondary-foreground font-medium">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{fam.members_count || 0} सदस्य</span>
                      </div>
                      {typeof fam.photos_count === "number" && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-secondary text-secondary-foreground font-medium">
                          <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
                          <span>{fam.photos_count} तस्विर</span>
                        </div>
                      )}
                      {typeof fam.stories_count === "number" && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-secondary text-secondary-foreground font-medium">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{fam.stories_count} इतिहास</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Card Action Footers */}
                <div className="p-5 pt-0 space-y-2">
                  <Link href={`/family/${fam.id}/tree`} className="block w-full">
                    <Button className="w-full gap-2 shadow-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                      <TreePine className="h-4 w-4" />
                      वंशावली हेर्नुहोस् (Explore Tree)
                    </Button>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/family/${fam.id}/media`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        तस्विर (Media)
                      </Button>
                    </Link>
                    <Link href={`/family/${fam.id}/stories`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        इतिहास (Stories)
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
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
