"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { handleGoogleCallback } from "@/lib/services/google-calendar-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Componente interno que usa useSearchParams
function GoogleCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Usamos window.location em vez de useSearchParams
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  useEffect(() => {
    const processCallback = async () => {
      try {
        const storedState = localStorage.getItem("googleOAuthState")

        // Verificar se o state é válido
        if (!state || state !== storedState) {
          throw new Error("Estado inválido, possível ataque CSRF")
        }

        // Limpar o state armazenado
        localStorage.removeItem("googleOAuthState")

        if (!code) {
          throw new Error("Código de autorização não encontrado")
        }

        const result = await handleGoogleCallback(code)

        if (!result.success) {
          throw new Error("Falha ao processar autenticação do Google")
        }

        setStatus("success")
      } catch (err: any) {
        console.error("Erro no callback do Google:", err)
        setStatus("error")
        setError(err.message || "Ocorreu um erro ao conectar com o Google Calendar")
      }
    }

    processCallback()
  }, [code, state])

  const handleContinue = () => {
    router.push("/dashboard/profile")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Conexão com Google Calendar</CardTitle>
        <CardDescription>
          {status === "loading"
            ? "Processando sua solicitação..."
            : status === "success"
              ? "Sua conta foi conectada com sucesso!"
              : "Ocorreu um erro ao conectar sua conta"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}

        {status === "success" && (
          <Alert className="mb-4 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Sua conta do Google Calendar foi conectada com sucesso! Agora você pode sincronizar suas audiências.
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Ocorreu um erro desconhecido"}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 flex justify-center">
          <Button onClick={handleContinue}>{status === "success" ? "Voltar ao Perfil" : "Tentar Novamente"}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente principal com Suspense
export default function GoogleCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        }
      >
        <GoogleCallbackContent />
      </Suspense>
    </div>
  )
}
