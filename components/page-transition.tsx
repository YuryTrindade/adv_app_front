"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Componente que usa useSearchParams
function PageTransitionInner() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [prevPathname, setPrevPathname] = useState("")

  useEffect(() => {
    // Evitar disparar o efeito na montagem inicial
    if (prevPathname === "") {
      setPrevPathname(pathname)
      return
    }

    // Verificar se o pathname realmente mudou
    if (pathname !== prevPathname) {
      setPrevPathname(pathname)

      // Quando a rota muda, inicia o loading
      setIsLoading(true)
      setProgress(0)

      // Simula progresso rápido
      const timer1 = setTimeout(() => setProgress(30), 50)
      const timer2 = setTimeout(() => setProgress(60), 100)
      const timer3 = setTimeout(() => setProgress(80), 150)

      // Finaliza o loading após um breve período
      const timer4 = setTimeout(() => {
        setProgress(100)
        setTimeout(() => setIsLoading(false), 200) // Mantém 100% por um momento antes de esconder
      }, 300)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
      }
    }
  }, [pathname, prevPathname])

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-opacity duration-300",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <Progress value={progress} className="h-1 rounded-none bg-background" />
    </div>
  )
}

// Componente principal com Suspense
export function PageTransition() {
  return (
    <Suspense fallback={null}>
      <PageTransitionInner />
    </Suspense>
  )
}
