import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between bg-[#555] p-3 rounded-sm shadow-sm opacity-50">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-slate-400" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-slate-400" />
                        <Skeleton className="h-3 w-20 bg-slate-400" />
                    </div>
                </div>
                <Skeleton className="h-9 w-24 bg-slate-400" />
            </div>

            {/* Review List Skeletons */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 rounded-sm shadow-sm space-y-3 bg-white">
                        {/* Review Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                                {/* Optional Tag */}
                                {i % 2 === 0 && <Skeleton className="h-5 w-10 rounded-md" />}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            {i % 3 === 0 && <Skeleton className="h-4 w-1/2" />}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex gap-4">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
