// components/MyEventsFilter.tsx
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function MyEventsFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  return (
    <div className="flex gap-3">
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
          <SelectItem value="draft">Drafts</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}