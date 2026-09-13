import "./globals.css";
import type { Metadata } from "next";
import QueryProvider from "@/providers/QueryProvider";
import AuthInitializer from "@/components/AuthInitializer";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Family Historical Tree",
  description: "Preserve, explore, and visualize your family lineages and historical memories.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <QueryProvider>
          <ToastProvider>
            <AuthInitializer />
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
