"use client"

import { TiptapRenderer } from "@/components/admin/blog/tiptap-renderer"

export function BlogPostRenderer({ content }: { content: any }) {
  return (
    <div className="prose prose-xl max-w-none prose-headings:tracking-tight prose-headings:text-foreground prose-h1:font-montserrat prose-h1:font-black prose-h1:mb-4 prose-h1:mt-12 prose-h1:text-4xl prose-h2:font-bebas prose-h2:font-normal prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-3xl prose-h2:tracking-wide prose-h3:font-bebas prose-h3:font-normal prose-h3:mb-3 prose-h3:mt-8 prose-h3:text-2xl prose-h3:tracking-wide prose-h4:font-bebas prose-h4:font-normal prose-h4:mb-2 prose-h4:mt-6 prose-h4:tracking-wide prose-h5:font-bebas prose-h5:font-normal prose-h5:mb-2 prose-h5:mt-6 prose-h5:tracking-wide prose-h6:font-bebas prose-h6:font-normal prose-h6:mb-2 prose-h6:mt-6 prose-h6:tracking-wide prose-p:mb-6 prose-p:leading-[1.75] prose-p:text-foreground/80 prose-p:font-raleway prose-p:text-xl prose-a:font-medium prose-a:font-raleway prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-foreground prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:font-raleway prose-img:my-8 prose-img:rounded-lg prose-video:my-8 prose-video:rounded-lg prose-pre:bg-muted prose-pre:text-sm prose-ol:my-6 prose-ol:font-raleway prose-ul:my-6 prose-ul:font-raleway prose-li:my-2 prose-li:font-raleway prose-li:text-foreground/80 dark:prose-invert">
      <TiptapRenderer content={content} />
    </div>
  )
}
