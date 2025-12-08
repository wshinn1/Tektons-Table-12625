"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Sparkles, BookOpen } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  is_premium: boolean
  icon?: string
  color?: string
}

interface ResourceCategoryNavProps {
  categories: Category[]
  activeSlug: string | null
}

export function ResourceCategoryNav({ categories, activeSlug }: ResourceCategoryNavProps) {
  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href="/resources"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
          activeSlug === null ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground",
        )}
      >
        <BookOpen className="w-4 h-4" />
        All Resources
      </Link>

      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/resources/category/${category.slug}`}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            activeSlug === category.slug
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground",
          )}
        >
          {category.is_premium && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          {category.name}
        </Link>
      ))}
    </nav>
  )
}
