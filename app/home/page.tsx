import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to root which will load app/page.tsx
  redirect("/")
}
