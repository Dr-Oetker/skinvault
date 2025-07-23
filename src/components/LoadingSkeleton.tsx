

interface LoadingSkeletonProps {
  type?: "spinner" | "skeleton" | "card" | "page";
  className?: string;
  lines?: number; // for skeleton
  cards?: number; // for card skeleton
}

export default function LoadingSkeleton({ type = "spinner", className = "", lines = 3, cards = 6 }: LoadingSkeletonProps) {
  if (type === "skeleton") {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-5 bg-dark-bg-tertiary/60 rounded w-full animate-pulse"
            style={{ width: `${80 + Math.random() * 20}%` }}
          />
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 ${className}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="glass-card rounded-2xl p-6 h-48 flex flex-col items-center justify-center border border-dark-border-primary/60">
              {/* Image Skeleton */}
              <div className="w-20 h-20 mb-4 rounded-xl border border-dark-border-primary/60 bg-dark-bg-secondary flex-shrink-0"></div>
              
              {/* Text Skeleton */}
              <div className="text-center flex-1 flex flex-col justify-center min-w-0 w-full">
                <div className="h-5 bg-dark-bg-secondary rounded mb-1 w-3/4 mx-auto"></div>
                <div className="h-4 bg-dark-bg-secondary rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "page") {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-dark-bg-secondary rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-6 w-24 bg-dark-bg-secondary rounded"></div>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="w-10 h-10 bg-dark-bg-secondary rounded-full"></div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="glass-card p-6 md:p-8 shadow-dark-lg border border-dark-border-primary/60">
          <div className="space-y-4">
            <div className="h-8 bg-dark-bg-secondary rounded w-1/3"></div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-dark-bg-secondary rounded" style={{ width: `${70 + Math.random() * 30}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Spinner fallback
  return (
    <div className={`flex justify-center items-center py-16 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-8 w-8 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="text-dark-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
} 