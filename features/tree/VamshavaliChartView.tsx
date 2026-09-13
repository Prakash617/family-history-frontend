"use client";

import React, { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Printer, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartPerson {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  textColor: string;
}

interface VamshavaliChartViewProps {
  onSelectPersonByName?: (name: string) => void;
}

export default function VamshavaliChartView({ onSelectPersonByName }: VamshavaliChartViewProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Center horizontally on initial mount
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    }
  }, []);

  const handleReset = () => {
    setZoom(1);
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollTo({
        left: Math.max(0, (el.scrollWidth - el.clientWidth) / 2),
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleClick = (name: string) => {
    if (onSelectPersonByName) {
      onSelectPersonByName(name);
    }
  };

  const Card = ({
    name,
    bg = "bg-[#f0fdf4]",
    border = "border-[#4ade80]",
    text = "text-[#14532d]",
    className = "",
  }: {
    name: string;
    bg?: string;
    border?: string;
    text?: string;
    className?: string;
  }) => (
    <div
      onClick={() => handleClick(name)}
      className={`min-w-[140px] sm:min-w-[170px] px-3 py-2 rounded-lg border-2 text-center font-bold text-sm sm:text-base cursor-pointer shadow-xs hover:scale-105 hover:shadow-md transition-all select-none ${bg} ${border} ${text} ${className}`}
    >
      {name}
    </div>
  );

  const Rings = () => (
    <div className="flex items-center justify-center text-amber-600 px-1 font-bold text-lg" title="विवाहित जोडी (Spouse)">
      ⚭
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto p-4 sm:p-8 bg-[#faf8f5] dark:bg-[#141210] min-h-[85vh] flex flex-col items-center scroll-smooth"
    >
      {/* Viewport controls */}
      <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 bg-card/95 backdrop-blur-md p-2 rounded-xl border border-border shadow-md mb-6">
        <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="h-8 gap-1 text-xs">
          <ZoomIn className="h-4 w-4" />
          Zoom In
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))} className="h-8 gap-1 text-xs">
          <ZoomOut className="h-4 w-4" />
          Zoom Out
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-8 gap-1.5 text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border-border"
          title="Reset zoom and scroll to initial center position"
        >
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          <span>Reset Position (रिसेट)</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 gap-1 text-xs">
          <Printer className="h-4 w-4" />
          Print / PDF
        </Button>
      </div>

      {/* Main Chart Container */}
      <div
        style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        className="transition-transform duration-150 flex flex-col items-center w-full max-w-6xl pb-20"
      >
        {/* Poster Header */}
        <div className="text-center mb-8 space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e293b] dark:text-[#f1f5f9] tracking-wide font-serif">
            थापा परिवार वंशावली
          </h1>
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="h-0.5 w-16 bg-primary/40 rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">पुर्ख्यौली अभिलेख</span>
            <div className="h-0.5 w-16 bg-primary/40 rounded-full" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* GENERATION 1: बाघ सिंह थापा                              */}
        {/* ======================================================== */}
        <div className="flex flex-col items-center">
          <Card
            name="बाघ सिंह थापा"
            bg="bg-[#faf5ff]"
            border="border-[#c084fc]"
            text="text-[#6b21a8]"
            className="min-w-[200px]"
          />
          {/* Vertical line down */}
          <div className="w-0.5 h-8 bg-slate-400" />
        </div>

        {/* ======================================================== */}
        {/* GENERATION 2: हस्त बहादुर थापा                           */}
        {/* ======================================================== */}
        <div className="flex flex-col items-center">
          <Card
            name="हस्त बहादुर थापा"
            bg="bg-[#f0f9ff]"
            border="border-[#38bdf8]"
            text="text-[#0369a1]"
            className="min-w-[200px]"
          />
          {/* Vertical line down */}
          <div className="w-0.5 h-8 bg-slate-400" />
        </div>

        {/* ======================================================== */}
        {/* GENERATION 3: ४ छोराहरू (नैन, नानी, डिल्ली, कान्छ)        */}
        {/* ======================================================== */}
        <div className="w-full flex flex-col items-center">
          {/* Horizontal crossbar connecting 4 children */}
          <div className="w-[78%] h-0.5 bg-slate-400" />

          {/* 4 drop lines */}
          <div className="w-[78%] flex justify-between">
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
          </div>

          {/* Cards for Gen 3 */}
          <div className="w-[84%] flex justify-between items-start gap-4">
            {/* Child 1: नैन बहादुर */}
            <div className="flex flex-col items-center">
              <Card name="नैन बहादुर थापा" />
            </div>

            {/* Child 2: नानी बहादुर ⚭ मानकुमारी (Branch with continuation) */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <Card name="नानी बहादुर थापा" />
                <Rings />
                <Card name="मानकुमारी थापा" bg="bg-[#fdf2f8]" border="border-[#f472b6]" text="text-[#9d174d]" />
              </div>
              {/* Drop line to Generation 4 */}
              <div className="w-0.5 h-8 bg-slate-400" />
            </div>

            {/* Child 3: डिल्ली थापा */}
            <div className="flex flex-col items-center">
              <Card name="डिल्ली थापा" />
            </div>

            {/* Child 4: कान्छ थापा */}
            <div className="flex flex-col items-center">
              <Card name="कान्छ थापा" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* GENERATION 4: ६ छोराहरू (शिव, सोम, डिल्ली, कृष्ण, बिष्णु, शान्ताराम) */}
        {/* ======================================================== */}
        <div className="w-full flex flex-col items-center mt-0">
          {/* Horizontal crossbar connecting 6 children */}
          <div className="w-[96%] h-0.5 bg-slate-400" />

          {/* 6 drop lines */}
          <div className="w-[96%] flex justify-between">
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
          </div>

          {/* Cards for Gen 4 */}
          <div className="w-full flex justify-between items-start gap-2 sm:gap-4">
            <Card name="शिव थापा" bg="bg-[#fefce8]" border="border-[#facc15]" text="text-[#854d0e]" />

            {/* सोम बहादुर थापा ⚭ खुम कुमारी थापा (Branch with continuation) */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <Card name="सोम बहादुर थापा" bg="bg-[#f0f9ff]" border="border-[#38bdf8]" text="text-[#0369a1]" />
                <Rings />
                <Card name="खुम कुमारी थापा" bg="bg-[#fdf2f8]" border="border-[#f472b6]" text="text-[#9d174d]" />
              </div>
              {/* Drop line to Gen 5 */}
              <div className="w-0.5 h-8 bg-slate-400" />
            </div>

            <Card name="डिल्ली थापा" bg="bg-[#fefce8]" border="border-[#facc15]" text="text-[#854d0e]" />
            <Card name="कृष्ण थापा" bg="bg-[#fefce8]" border="border-[#facc15]" text="text-[#854d0e]" />
            <Card name="बिष्णु थापा" bg="bg-[#fefce8]" border="border-[#facc15]" text="text-[#854d0e]" />
            <Card name="शान्ताराम थापा" bg="bg-[#fefce8]" border="border-[#facc15]" text="text-[#854d0e]" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* GENERATION 5: इन्द्र बहादुर & क्षत्र बहादुर                */}
        {/* ======================================================== */}
        <div className="w-[60%] flex flex-col items-center mt-0">
          {/* Horizontal crossbar connecting 2 sons */}
          <div className="w-[70%] h-0.5 bg-slate-400" />

          {/* 2 drop lines */}
          <div className="w-[70%] flex justify-between">
            <div className="w-0.5 h-6 bg-slate-400" />
            <div className="w-0.5 h-6 bg-slate-400" />
          </div>

          <div className="w-full flex justify-between items-start gap-8">
            {/* इन्द्र बहादुर थापा ⚭ राधिका थापा */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <Card name="इन्द्र बहादुर थापा" />
                <Rings />
                <Card name="राधिका थापा" bg="bg-[#fdf2f8]" border="border-[#f472b6]" text="text-[#9d174d]" />
              </div>
              {/* Drop line to Gen 6 */}
              <div className="w-0.5 h-8 bg-slate-400" />
            </div>

            {/* क्षत्र बहादुर थापा ⚭ सरस्वती थापा */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <Card name="क्षत्र बहादुर थापा" />
                <Rings />
                <Card name="सरस्वती थापा" bg="bg-[#fdf2f8]" border="border-[#f472b6]" text="text-[#9d174d]" />
              </div>
              {/* Drop line to Gen 6 */}
              <div className="w-0.5 h-8 bg-slate-400" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* GENERATION 6: नातिनातिनाहरू                              */}
        {/* ======================================================== */}
        <div className="w-full flex justify-between items-start pt-0 px-4">
          {/* Children of Indra & Radhika: राजषी, उज्ज्वल, उदय */}
          <div className="w-[48%] flex flex-col items-center">
            <div className="w-[75%] h-0.5 bg-slate-400" />
            <div className="w-[75%] flex justify-between">
              <div className="w-0.5 h-6 bg-slate-400" />
              <div className="w-0.5 h-6 bg-slate-400" />
              <div className="w-0.5 h-6 bg-slate-400" />
            </div>
            <div className="w-full flex justify-center gap-3 sm:gap-4">
              <Card name="राजषी थापा" bg="bg-[#faf5ff]" border="border-[#c084fc]" text="text-[#6b21a8]" />
              <Card name="उज्ज्वल थापा" bg="bg-[#faf5ff]" border="border-[#c084fc]" text="text-[#6b21a8]" />
              <Card name="उदय थापा" bg="bg-[#faf5ff]" border="border-[#c084fc]" text="text-[#6b21a8]" />
            </div>
          </div>

          {/* Children of Kshetra & Saraswati: निल बहादुर, निलिसा */}
          <div className="w-[45%] flex flex-col items-center">
            <div className="w-[60%] h-0.5 bg-slate-400" />
            <div className="w-[60%] flex justify-between">
              <div className="w-0.5 h-6 bg-slate-400" />
              <div className="w-0.5 h-6 bg-slate-400" />
            </div>
            <div className="w-full flex justify-center gap-3 sm:gap-4">
              <Card name="निल बहादुर थापा" bg="bg-[#faf5ff]" border="border-[#c084fc]" text="text-[#6b21a8]" />
              <Card name="निलिसा थापा" bg="bg-[#faf5ff]" border="border-[#c084fc]" text="text-[#6b21a8]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
