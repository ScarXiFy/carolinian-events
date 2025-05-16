'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { debounce } from 'lodash'

export function SearchEvents({ 
  defaultValue = '',
  placeholder = 'Search events...',
  debounceTime = 300 
}: { 
  defaultValue?: string
  placeholder?: string
  debounceTime?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(defaultValue)

  // Create query string with updated search params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      router.replace(`${pathname}?${createQueryString('query', query)}`)
    }, debounceTime),
    [pathname, createQueryString, router]
  )

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    debouncedSearch(value)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-10 w-full"
        value={searchQuery}
        onChange={handleChange}
        aria-label="Search events"
      />
    </div>
  )
}