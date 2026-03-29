"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface EventFilters {
  search: string;
  category: string;
  priceType: string;
  view: "cards" | "calendar";
}

interface EventFiltersProps {
  initialFilters?: Partial<EventFilters>;
  onFilterChange: (filters: EventFilters) => void;
}

const categories = [
  "All",
  "Cultural",
  "Sports",
  "Entertainment",
  "Religious",
  "Social",
  "AGM",
];

const priceTypes = ["All", "Free", "Paid"];

export function EventFiltersBar({ initialFilters, onFilterChange }: EventFiltersProps) {
  const [search, setSearch] = useState(initialFilters?.search ?? "");
  const [category, setCategory] = useState(initialFilters?.category ?? "All");
  const [priceType, setPriceType] = useState(initialFilters?.priceType ?? "All");
  const [view, setView] = useState<"cards" | "calendar">(
    initialFilters?.view ?? "cards"
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitChange = useCallback(
    (overrides: Partial<EventFilters> = {}) => {
      onFilterChange({
        search,
        category,
        priceType,
        view,
        ...overrides,
      });
    },
    [search, category, priceType, view, onFilterChange]
  );

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        emitChange({ search: value });
      }, 300);
    },
    [emitChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    emitChange({ category: val });
  };

  const handlePriceChange = (val: string) => {
    setPriceType(val);
    emitChange({ priceType: val });
  };

  const handleViewChange = (val: "cards" | "calendar") => {
    setView(val);
    emitChange({ view: val });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          label="Search"
          placeholder="Search events..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search events"
        />
      </div>

      {/* Category */}
      <div className="min-w-[160px]">
        <label
          htmlFor="category-filter"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="min-w-[120px]">
        <label
          htmlFor="price-filter"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Price
        </label>
        <select
          id="price-filter"
          value={priceType}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          aria-label="Filter by price"
        >
          {priceTypes.map((pt) => (
            <option key={pt} value={pt}>
              {pt}
            </option>
          ))}
        </select>
      </div>

      {/* View toggle */}
      <div className="flex items-end">
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            View
          </span>
          <div className="inline-flex rounded-md border border-gray-300" role="group" aria-label="Switch view">
            <Button
              variant={view === "cards" ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("cards")}
              className="rounded-r-none border-0"
              aria-pressed={view === "cards"}
            >
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cards
            </Button>
            <Button
              variant={view === "calendar" ? "primary" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("calendar")}
              className="rounded-l-none border-0"
              aria-pressed={view === "calendar"}
            >
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
