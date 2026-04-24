import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Zap } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const isLanding = location === "/";

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md ${isLanding ? "bg-background/80 border-transparent" : "bg-card/80 border-border"}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="font-semibold text-lg tracking-tight">LocusPilot</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/activity" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Activity
            </Link>
            <Link href="/create">
              <Button size="sm" className="rounded-full px-5 font-medium shadow-sm">
                Create new
              </Button>
            </Link>
          </nav>

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/dashboard" className="text-lg font-medium">Dashboard</Link>
                <Link href="/activity" className="text-lg font-medium">Activity</Link>
                <Link href="/create">
                  <Button className="w-full">Create new</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-muted/30 py-8 mt-auto">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LocusPilot. All rights reserved.</p>
          <div className="flex items-center gap-2 font-medium text-foreground/70 bg-card px-3 py-1.5 rounded-full border shadow-sm">
            Powered by CheckoutWithLocus
          </div>
        </div>
      </footer>
    </div>
  );
}
