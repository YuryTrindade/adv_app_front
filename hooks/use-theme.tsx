"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  // Garantir que o componente está montado para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Usar o resolvedTheme para garantir que estamos usando o tema atual real
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  return {
    theme: mounted ? theme : undefined,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    setTheme,
    toggleTheme,
    isDarkTheme: mounted && resolvedTheme === "dark",
    mounted,
  }
}
