"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    oab_cpf: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Aplicar máscara para telefone
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "")
      let formatted = ""

      if (cleaned.length <= 11) {
        if (cleaned.length > 2) {
          formatted += `(${cleaned.substring(0, 2)}`

          if (cleaned.length > 2) {
            formatted += `) ${cleaned.substring(2, 7)}`

            if (cleaned.length > 7) {
              formatted += `-${cleaned.substring(7, 11)}`
            }
          }
        } else {
          formatted = cleaned
        }

        setFormData({ ...formData, [name]: formatted })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.")
      setIsLoading(false)
      return
    }

    try {
      const { error, emailConfirm } = await signUp({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        oab_cpf: formData.oab_cpf,
        password: formData.password,
      })

      if (error) {
        // Log detalhado do erro no console para debugging
        console.error("Erro no cadastro:", error)

        // Mensagem genérica para o usuário
        setError("Ocorreu um erro no seu cadastro, tente novamente mais tarde")

        // Mensagens específicas apenas para alguns casos comuns
        if (error.message && error.message.includes("already registered")) {
          setError("Este email já está registrado.")
        }
      } else if (emailConfirm) {
        // Se o usuário precisa confirmar o email
        setSuccess(
          "Conta criada com sucesso! Por favor, verifique seu email para confirmar o cadastro antes de fazer login.",
        )
      } else {
        // Se não precisa de confirmação, redireciona para o login
        router.push("/login?message=Conta criada com sucesso! Por favor, faça login.")
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
      setError("Ocorreu um erro no seu cadastro, tente novamente mais tarde")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>Preencha os dados abaixo para criar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nome</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Sobrenome</Label>
                  <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (Celular)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(99) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oab_cpf">Número da OAB ou CPF</Label>
                <Input id="oab_cpf" name="oab_cpf" value={formData.oab_cpf} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
