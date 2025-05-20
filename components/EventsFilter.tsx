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
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set(name, value)
    return params.toString()
  }

  const currentCategory = searchParams?.get('category') || ''

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={currentCategory === '' ? 'all' : currentCategory}
        onValueChange={(value) => {
          const categoryValue = value === 'all' ? '' : value
          router.replace(`${pathname}?${createQueryString('category', categoryValue)}`)
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {children}
        </SelectContent>
      </Select>

      <Select
        value={searchParams?.get('filter') || 'all'}
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