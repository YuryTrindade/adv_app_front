"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Case, Client } from "@/lib/types/database"
import { createCase, updateCase } from "@/lib/services/case-service"
import { getClients } from "@/lib/services/client-service"

interface CaseFormProps {
  caseData?: Case
  onSuccess?: () => void
}

export function CaseForm({ caseData, onSuccess }: CaseFormProps) {
  const [formData, setFormData] = useState({
    client_id: "",
    case_number: "",
    court: "",
    type: "",
    subject: "",
    status: "",
    description: "",
    filing_date: "",
  })
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    const loadClients = async () => {
      const { data, error } = await getClients()
      if (error) {
        console.error("Erro ao carregar clientes:", error)
      } else if (data) {
        setClients(data)
      }
      setIsLoadingClients(false)
    }

    loadClients()
  }, [])

  useEffect(() => {
    if (caseData) {
      setFormData({
        client_id: caseData.client_id || "",
        case_number: caseData.case_number || "",
        court: caseData.court || "",
        type: caseData.type || "",
        subject: caseData.subject || "",
        status: caseData.status || "",
        description: caseData.description || "",
        filing_date: caseData.filing_date || "",
      })

      if (caseData.filing_date) {
        setDate(new Date(caseData.filing_date))
      }
    }
  }, [caseData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleDateChange = (date: Date | undefined) => {
    setDate(date)
    if (date) {
      setFormData({ ...formData, filing_date: format(date, "yyyy-MM-dd") })
    } else {
      setFormData({ ...formData, filing_date: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (caseData) {
        // Atualizar processo existente
        const { error } = await updateCase(caseData.id, formData)
        if (error) {
          console.error("Erro ao atualizar processo:", error)
          setError("Ocorreu um erro ao atualizar o processo. Por favor, tente novamente.")
        } else {
          setSuccess("Processo atualizado com sucesso!")
          if (onSuccess) {
            onSuccess()
          }
        }
      } else {
        // Criar novo processo
        const { data, error } = await createCase(formData)
        if (error) {
          console.error("Erro ao criar processo:", error)
          setError("Ocorreu um erro ao criar o processo. Por favor, tente novamente.")
        } else {
          setSuccess("Processo criado com sucesso!")
          if (onSuccess) {
            onSuccess()
          } else {
            router.push("/dashboard/cases")
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

  const caseTypes = [
    "Cível",
    "Criminal",
    "Trabalhista",
    "Tributário",
    "Administrativo",
    "Previdenciário",
    "Família",
    "Consumidor",
    "Outro",
  ]

  const caseStatuses = [
    "Em andamento",
    "Concluído",
    "Arquivado",
    "Suspenso",
    "Recurso",
    "Aguardando julgamento",
    "Aguardando documentação",
    "Outro",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{caseData ? "Editar Processo" : "Novo Processo"}</CardTitle>
        <CardDescription>
          {caseData ? "Atualize as informações do processo" : "Preencha os dados para cadastrar um novo processo"}
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
            <Label htmlFor="client_id">Cliente *</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => handleSelectChange("client_id", value)}
              disabled={isLoadingClients}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingClients ? (
                  <SelectItem value="loading" disabled>
                    Carregando clientes...
                  </SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Nenhum cliente cadastrado
                  </SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="case_number">Número do Processo *</Label>
            <Input id="case_number" name="case_number" value={formData.case_number} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="court">Tribunal/Vara</Label>
            <Input id="court" name="court" value={formData.court} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Processo *</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {caseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {caseStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto/Objeto *</Label>
            <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filing_date">Data de Distribuição</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição/Observações</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Informações adicionais sobre o processo"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Salvando..." : caseData ? "Atualizar Processo" : "Cadastrar Processo"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={() => router.push("/dashboard/cases")}>
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  )
}
