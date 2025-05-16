// components/EventsFilter.tsx
'use client' // This must be at the very top

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface EventsFilterProps {
  children?: React.ReactNode
}

export function EventsFilter({ children }: EventsFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={searchParams.get('category') || ''}
        onValueChange={(value) => {
          router.replace(`${pathname}?${createQueryString('category', value)}`)
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {children}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('filter') || 'all'}
        onValueChange={(value) => {
          router.replace(`${pathname}?${createQueryString('filter', value)}`)
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="past">Past</SelectItem>
          <SelectItem value="free">Free</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}