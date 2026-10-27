import type React from "react"
import { AuthProvider } from "@/lib/context/auth-context"
// Importe o componente PageTransition
import { PageTransition } from "@/components/page-transition"

// Adicione o componente PageTransition dentro do AuthLayout
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageTransition />
      <AuthProvider>{children}</AuthProvider>
    </div>
  )
}
