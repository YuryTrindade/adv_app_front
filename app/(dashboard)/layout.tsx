"use client"

import type React from "react"

import { useAuth } from "@/lib/context/auth-context"
import { redirect } from "next/navigation"
import { AuthProvider } from "@/lib/context/auth-context"
import { Header } from "@/components/header"
import { PageTransition } from "@/components/page-transition"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth()
  const [showRecovery, setShowRecovery] = useState(false)

  // Adicionar um timeout para mostrar o botão de recuperação
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowRecovery(true)
      }, 5000) // 5 segundos
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading])

  // Mostrar um indicador de carregamento com botão de fallback
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-muted-foreground mb-4">Carregando...</p>

        {showRecovery && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-red-500 mb-2">O carregamento está demorando mais do que o esperado.</p>
            <button
              onClick={() => {
                // Limpar cookies e recarregar
                document.cookie = "sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                document.cookie = "sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                window.location.href = "/login"
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Limpar sessão e tentar novamente
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageTransition />
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</div>
      </main>
    </div>
  )
}
