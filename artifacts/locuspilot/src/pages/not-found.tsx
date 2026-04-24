import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-6 px-4">
          <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <FileQuestion className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
