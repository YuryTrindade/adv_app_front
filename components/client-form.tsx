"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Client } from "@/lib/types/database"
import { createClient, updateClient } from "@/lib/services/client-service"

interface ClientFormProps {
  client?: Client
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf_cnpj: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        cpf_cnpj: client.cpf_cnpj || "",
        address: client.address || "",
        city: client.city || "",
        state: client.state || "",
        zip_code: client.zip_code || "",
        notes: client.notes || "",
      })
    }
  }, [client])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    }
    // Aplicar máscara para CEP
    else if (name === "zip_code") {
      const cleaned = value.replace(/\D/g, "")
      let formatted = ""

      if (cleaned.length <= 8) {
        if (cleaned.length > 5) {
          formatted = `${cleaned.substring(0, 5)}-${cleaned.substring(5, 8)}`
        } else {
          formatted = cleaned
        }

        setFormData({ ...formData, [name]: formatted })
      }
    }
    // Aplicar máscara para CPF/CNPJ
    else if (name === "cpf_cnpj") {
      const cleaned = value.replace(/\D/g, "")
      let formatted = ""

      // CPF
      if (cleaned.length <= 11) {
        if (cleaned.length > 9) {
          formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(
            6,
            9,
          )}-${cleaned.substring(9, 11)}`
        } else if (cleaned.length > 6) {
          formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}`
        } else if (cleaned.length > 3) {
          formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}`
        } else {
          formatted = cleaned
        }
      }
      // CNPJ
      else if (cleaned.length <= 14) {
        if (cleaned.length > 12) {
          formatted = `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(
            5,
            8,
          )}/${cleaned.substring(8, 12)}-${cleaned.substring(12, 14)}`
        } else if (cleaned.length > 8) {
          formatted = `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(
            5,
            8,
          )}/${cleaned.substring(8, 12)}`
        } else if (cleaned.length > 5) {
          formatted = `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5, 8)}`
        } else if (cleaned.length > 2) {
          formatted = `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}`
        } else {
          formatted = cleaned
        }
      }

      setFormData({ ...formData, [name]: formatted })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Verificar se o usuário está autenticado
    if (!user) {
      setError("Você precisa estar autenticado para realizar esta operação. Por favor, faça login novamente.")
      setIsLoading(false)
      return
    }

    try {
      if (client) {
        // Atualizar cliente existente
        const { error } = await updateClient(client.id, formData)
        if (error) {
          console.error("Erro ao atualizar cliente:", error)
          setError("Ocorreu um erro ao atualizar o cliente. Por favor, tente novamente.")
        } else {
          setSuccess("Cliente atualizado com sucesso!")
          if (onSuccess) {
            onSuccess()
          }
        }
      } else {
        // Criar novo cliente
        console.log("Tentando criar cliente com os dados:", formData)
        const { data, error } = await createClient(formData)

        if (error) {
          console.error("Erro ao criar cliente:", error)
          if (error.message && error.message.includes("não autenticado")) {
            setError("Você precisa estar autenticado para criar um cliente. Por favor, faça login novamente.")
          } else {
            setError("Ocorreu um erro ao criar o cliente. Por favor, tente novamente.")
          }
        } else {
          console.log("Cliente criado com sucesso:", data)
          setSuccess("Cliente criado com sucesso!")
          if (onSuccess) {
            onSuccess()
          } else {
            router.push("/dashboard/clients")
          }
        }
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{client ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
        <CardDescription>
          {client ? "Atualize as informações do cliente" : "Preencha os dados para cadastrar um novo cliente"}
        </CardDescription>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(99) 99999-9999"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input id="cpf_cnpj" name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" name="state" maxLength={2} value={formData.state} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                name="zip_code"
                placeholder="99999-999"
                value={formData.zip_code}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Informações adicionais sobre o cliente"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Salvando..." : client ? "Atualizar Cliente" : "Cadastrar Cliente"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={() => router.push("/dashboard/clients")}>
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  )
}
