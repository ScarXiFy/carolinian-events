"use client";

import { ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type SortSelectProps = {
  currentSort: string;
  sortLabels: Record<string, string>;
  currentSearch: string;
};

export function SortSelect({ currentSort, sortLabels, currentSearch }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    // Reset to page 1 on sort change
    params.delete("page");
    if (!currentSearch.trim()) {
      params.delete("search");
    }
    router.push(`/events?${params.toString()}`);
  }

  return (
    <label className="events-sort-field">
      <span className="sr-only">Sort events</span>
      <select value={currentSort} onChange={handleChange}>
        {Object.entries(sortLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ArrowUpDown size={20} aria-hidden="true" />
    </label>
  );
}
