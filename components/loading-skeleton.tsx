import { Card, CardContent } from "@/components/ui/card"

export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 bg-gray-200 animate-pulse" />
      <CardContent className="p-6 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-9 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      </div>
    </div>
  )
}
