import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted/50", className)} />
  );
}

// Project Card Skeleton
export function ProjectCardSkeleton() {
  return (
    <div className="p-6 bg-chatgpt-card rounded-3xl border border-border animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <LoadingSkeleton className="h-6 w-32" />
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-4 w-16" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-8 w-8 rounded-full" />
          <LoadingSkeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Mindmap Skeleton
export function MindmapSkeleton() {
  return (
    <div className="w-full h-[600px] bg-chatgpt-card rounded-3xl p-6 border border-border animate-pulse">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingSkeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <LoadingSkeleton className="h-6 w-48 mx-auto mb-2" />
          <LoadingSkeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Chat Message Skeleton
export function ChatMessageSkeleton() {
  return (
    <div className="flex justify-start animate-pulse">
      <div className="max-w-[80%] p-4 rounded-2xl bg-secondary border border-border">
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-5/6" />
          <LoadingSkeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

// Sidebar Stats Skeleton
export function SidebarStatsSkeleton() {
  return (
    <div className="mb-6 p-3 bg-sidebar-accent rounded-lg animate-pulse">
      <LoadingSkeleton className="h-4 w-20 mb-2" />
      <div className="grid grid-cols-2 gap-2">
        <LoadingSkeleton className="h-3 w-12" />
        <LoadingSkeleton className="h-3 w-12" />
        <LoadingSkeleton className="h-3 w-16" />
        <LoadingSkeleton className="h-3 w-14" />
      </div>
    </div>
  );
}






