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
import { AlertCircle, CheckCircle2, Calendar, MapPin } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import type { Hearing, Case } from "@/lib/types/database"
import { createHearing, updateHearing } from "@/lib/services/hearing-service"
import { getCases } from "@/lib/services/case-service"
import { addEventToGoogleCalendar } from "@/lib/services/google-calendar-service"
import { useAuth } from "@/lib/context/auth-context"

// Modifique a interface HearingFormProps para incluir initialDate
interface HearingFormProps {
  hearing?: Hearing
  caseId?: string
  initialDate?: string
  onSuccess?: () => void
}

export function HearingForm({ hearing, caseId, initialDate, onSuccess }: HearingFormProps) {
  const [formData, setFormData] = useState({
    case_id: "",
    title: "",
    date: "",
    location: "",
    description: "",
    status: "scheduled",
  })
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCases, setIsLoadingCases] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [addToGoogleCalendar, setAddToGoogleCalendar] = useState(false)
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [isLoadingAddressSuggestions, setIsLoadingAddressSuggestions] = useState(false)
  const { profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadCases = async () => {
      const { data, error } = await getCases()
      if (error) {
        console.error("Erro ao carregar processos:", error)
      } else if (data) {
        setCases(data)
      }
      setIsLoadingCases(false)
    }

    loadCases()
  }, [])

  // Modifique o useEffect que configura os dados iniciais (por volta da linha ~60)
  useEffect(() => {
    if (hearing) {
      setFormData({
        case_id: hearing.case_id || "",
        title: hearing.title || "",
        date: hearing.date || "",
        location: hearing.location || "",
        description: hearing.description || "",
        status: hearing.status || "scheduled",
      })

      if (hearing.date) {
        setSelectedDate(new Date(hearing.date))
      }
    } else if (caseId) {
      setFormData({
        ...formData,
        case_id: caseId,
      })
    }

    // Adicione esta parte para usar a data inicial se fornecida
    if (initialDate && !hearing) {
      setFormData((prev) => ({
        ...prev,
        date: initialDate,
      }))
      setSelectedDate(new Date(initialDate))
    }
  }, [hearing, caseId, initialDate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Se o campo for location, buscar sugestões de endereço
    if (name === "location" && value.length > 3) {
      fetchAddressSuggestions(value)
    }
  }

  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 3) return

    setIsLoadingAddressSuggestions(true)
    try {
      // Simulando uma API de sugestão de endereços
      // Em produção, você usaria uma API real como Google Places API
      setTimeout(() => {
        const suggestions = [
          `${query} - Fórum Central`,
          `${query} - Tribunal de Justiça`,
          `${query} - Vara Cível`,
          `${query} - Vara Criminal`,
        ]
        setAddressSuggestions(suggestions)
        setIsLoadingAddressSuggestions(false)
      }, 500)
    } catch (error) {
      console.error("Erro ao buscar sugestões de endereço:", error)
      setIsLoadingAddressSuggestions(false)
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData({ ...formData, date: value })
    if (value) {
      setSelectedDate(new Date(value))
    } else {
      setSelectedDate(undefined)
    }
  }

  const handleAddressSuggestionClick = (suggestion: string) => {
    setFormData({ ...formData, location: suggestion })
    setAddressSuggestions([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let hearingResult

      if (hearing) {
        // Atualizar audiência existente
        const { data, error } = await updateHearing(hearing.id, formData)
        if (error) {
          console.error("Erro ao atualizar audiência:", error)
          setError("Ocorreu um erro ao atualizar a audiência. Por favor, tente novamente.")
          return
        }
        hearingResult = data
        setSuccess("Audiência atualizada com sucesso!")
      } else {
        // Criar nova audiência
        const { data, error } = await createHearing(formData)
        if (error) {
          console.error("Erro ao criar audiência:", error)
          setError("Ocorreu um erro ao criar a audiência. Por favor, tente novamente.")
          return
        }
        hearingResult = data
        setSuccess("Audiência criada com sucesso!")
      }

      // Adicionar ao Google Calendar se solicitado e conectado
      if (addToGoogleCalendar && profile?.google_calendar_connected && hearingResult) {
        try {
          // Buscar informações completas da audiência
          const fullHearing = {
            ...hearingResult,
            cases: cases.find((c) => c.id === hearingResult?.case_id),
          }

          const { success, error } = await addEventToGoogleCalendar(fullHearing)

          if (!success) {
            toast({
              variant: "warning",
              title: "Atenção",
              description: "A audiência foi salva, mas houve um erro ao adicionar ao Google Calendar: " + error,
            })
          } else {
            toast({
              title: "Sucesso",
              description: "Audiência adicionada ao Google Calendar com sucesso!",
            })
          }
        } catch (err) {
          console.error("Erro ao adicionar ao Google Calendar:", err)
          toast({
            variant: "warning",
            title: "Atenção",
            description: "A audiência foi salva, mas houve um erro ao adicionar ao Google Calendar.",
          })
        }
      }

      if (onSuccess) {
        onSuccess()
      } else if (caseId) {
        router.push(`/dashboard/cases/${caseId}/hearings`)
      } else {
        router.push("/dashboard/hearings")
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const hearingStatuses = [
    { value: "scheduled", label: "Agendada" },
    { value: "completed", label: "Realizada" },
    { value: "canceled", label: "Cancelada" },
    { value: "postponed", label: "Adiada" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hearing ? "Editar Audiência" : "Nova Audiência"}</CardTitle>
        <CardDescription>
          {hearing ? "Atualize as informações da audiência" : "Preencha os dados para cadastrar uma nova audiência"}
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
            <Label htmlFor="case_id">Processo *</Label>
            <Select
              value={formData.case_id}
              onValueChange={(value) => handleSelectChange("case_id", value)}
              disabled={isLoadingCases || !!caseId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um processo" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCases ? (
                  <SelectItem value="loading" disabled>
                    Carregando processos...
                  </SelectItem>
                ) : cases.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Nenhum processo cadastrado
                  </SelectItem>
                ) : (
                  cases.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.case_number} - {caseItem.clients?.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título da Audiência *</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data e Hora *</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              value={formData.date ? formData.date.slice(0, 16) : ""}
              onChange={handleDateTimeChange}
              required
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="location">Local</Label>
            <div className="flex">
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Digite o endereço da audiência"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={() => fetchAddressSuggestions(formData.location)}
                disabled={isLoadingAddressSuggestions || formData.location.length < 3}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>

            {addressSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                {isLoadingAddressSuggestions ? (
                  <div className="flex items-center justify-center p-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2 text-sm">Buscando endereços...</span>
                  </div>
                ) : (
                  <ul className="max-h-60 overflow-auto py-1 text-sm">
                    {addressSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="cursor-pointer px-3 py-2 hover:bg-accent"
                        onClick={() => handleAddressSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{suggestion}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {hearingStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição/Observações</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Informações adicionais sobre a audiência"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {profile?.google_calendar_connected && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="google-calendar"
                checked={addToGoogleCalendar}
                onCheckedChange={(checked) => setAddToGoogleCalendar(checked as boolean)}
              />
              <Label htmlFor="google-calendar" className="cursor-pointer">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Adicionar ao Google Calendar</span>
                </div>
              </Label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Salvando..." : hearing ? "Atualizar Audiência" : "Cadastrar Audiência"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            if (caseId) {
              router.push(`/dashboard/cases/${caseId}/hearings`)
            } else {
              router.push("/dashboard/hearings")
            }
          }}
        >
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  )
}
