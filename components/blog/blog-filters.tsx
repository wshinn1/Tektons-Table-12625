"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, Crown } from "lucide-react"

interface BlogFiltersProps {
  categories: Array<{ id: string; name: string; slug: string; is_premium?: boolean }>
  tags: Array<{ id: string; name: string; slug: string }>
  basePath: string
}

export function BlogFilters({ categories, tags, basePath }: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

  const selectedCategory = searchParams.get("category")
  const selectedTag = searchParams.get("tag")

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page") // Reset to page 1 when filter changes
    router.push(`${basePath}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters("search", searchQuery || null)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    router.push(basePath)
  }

  const hasActiveFilters = selectedCategory || selectedTag || searchQuery

  return (
    <div className="mb-12 space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-6 text-base"
        />
      </form>

      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-semibold uppercase tracking-wide text-muted-foreground">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className={`cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground text-sm px-3 py-1.5 ${
                  category.is_premium && selectedCategory !== category.slug
                    ? "border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-white"
                    : ""
                }`}
                onClick={() => updateFilters("category", selectedCategory === category.slug ? null : category.slug)}
              >
                {category.is_premium && <Crown className="h-3 w-3 mr-1" />}
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-semibold uppercase tracking-wide text-muted-foreground">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTag === tag.slug ? "default" : "secondary"}
                className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground text-sm px-3 py-1.5"
                onClick={() => updateFilters("tag", selectedTag === tag.slug ? null : tag.slug)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  )
}
