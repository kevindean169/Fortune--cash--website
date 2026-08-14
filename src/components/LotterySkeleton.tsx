import React from 'react'

export function LotterySkeleton() {
  return (
    <div className="min-h-0 py-4 md:py-10 w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="h-[64px] bg-[#0c0c0c] border border-border/60 rounded-xl mb-6 flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-white/5 rounded-xl animate-pulse" />
            <div>
              <div className="h-5 w-32 bg-white/5 rounded mb-1 animate-pulse" />
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block h-3 w-16 bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-32 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-4 border-b border-border/50 mb-8 pb-2">
          <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
          <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1 */}
            <div className="bg-[#0c0c0c] border border-border/60 rounded-xl p-6">
              <div className="h-5 w-48 bg-white/5 rounded mb-6 animate-pulse" />
              <div className="grid grid-cols-6 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-[#0c0c0c] border border-border/60 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
                <div className="h-10 w-40 bg-white/5 rounded-xl animate-pulse" />
              </div>
              <div className="grid grid-cols-10 gap-2 mt-6">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            {/* Cart Card */}
            <div className="bg-[#0c0c0c] border border-border/60 rounded-xl p-6 h-[450px]">
              <div className="h-6 w-48 bg-white/5 rounded mb-6 animate-pulse" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Content Skeleton (Visible only on small screens) */}
        <div className="lg:hidden space-y-6">
          <div className="bg-[#0c0c0c] border border-border/60 rounded-xl p-4">
             <div className="h-4 w-32 bg-white/5 rounded mb-4 animate-pulse" />
             <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
                ))}
             </div>
          </div>
          <div className="bg-[#0c0c0c] border border-border/60 rounded-xl p-4 h-[300px] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
