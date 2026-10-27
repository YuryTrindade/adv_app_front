"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Calendar, Clock, MapPin, Briefcase } from "lucide-react"
import Link from "next/link"
import { getUpcomingHearings } from "@/lib/services/hearing-service"
import { getPendingDiligences } from "@/lib/services/diligence-service"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { profile } = useAuth()
  const [upcomingHearings, setUpcomingHearings] = useState<any[]>([])
  const [pendingDiligences, setPendingDiligences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Carregar audiências
        const { data: hearingsData, error: hearingsError } = await getUpcomingHearings(7) // Próximos 7 dias
        if (hearingsError) {
          console.error("Erro ao carregar audiências:", hearingsError)
        } else {
          setUpcomingHearings(hearingsData || [])
        }

        // Carregar diligências
        const { data: diligencesData, error: diligencesError } = await getPendingDiligences()
        if (diligencesError) {
          console.error("Erro ao carregar diligências:", diligencesError)
        } else {
          setPendingDiligences(diligencesData || [])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Ocorreu um erro ao carregar os dados do dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  const formatShortDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
      case "agendada":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
      case "concluida":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "canceled":
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "postponed":
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendada"
      case "completed":
        return "Realizada"
      case "canceled":
        return "Cancelada"
      case "postponed":
        return "Adiada"
      case "agendada":
        return "Agendada"
      case "em_andamento":
        return "Em andamento"
      case "concluida":
        return "Concluída"
      case "cancelada":
        return "Cancelada"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {profile?.first_name || "Usuário"}!</h1>
        <p className="text-muted-foreground">
          Este é o seu painel de controle do sistema de gerenciamento de escritório.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        <Card className="h-48 flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 justify-between">
            <p className="text-sm text-muted-foreground">Gerencie seus clientes e contatos.</p>
            <Button asChild size="sm" className="mt-auto w-full">
              <Link href="/dashboard/clients">
                <span>Ver Clientes</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-48 flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5 text-indigo-500" />
              Processos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 justify-between">
            <p className="text-sm text-muted-foreground">Acompanhe seus processos jurídicos.</p>
            <Button asChild size="sm" className="mt-auto w-full">
              <Link href="/dashboard/cases">
                <span>Ver Processos</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-48 flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-green-500" />
              Audiências
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 justify-between">
            <p className="text-sm text-muted-foreground">Gerencie suas audiências agendadas.</p>
            <Button asChild size="sm" className="mt-auto w-full">
              <Link href="/dashboard/hearings">
                <span>Ver Audiências</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-48 flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="flex items-center text-lg">
              <Briefcase className="mr-2 h-5 w-5 text-orange-500" />
              Diligências
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 justify-between">
            <p className="text-sm text-muted-foreground">Gerencie as diligências com advogados contratados.</p>
            <Button asChild size="sm" className="mt-auto w-full">
              <Link href="/dashboard/diligences">
                <span>Ver Diligências</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-48 flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-purple-500" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 justify-between">
            <p className="text-sm text-muted-foreground">Visualize seu calendário de compromissos.</p>
            <Button asChild size="sm" className="mt-auto w-full">
              <Link href="/dashboard/calendar">
                <span>Ver Calendário</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Próximas Audiências
            </CardTitle>
            <CardDescription>Audiências agendadas para os próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <p className="py-4 text-center text-muted-foreground">{error}</p>
            ) : upcomingHearings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                <p className="text-muted-foreground">Não há audiências agendadas para os próximos 7 dias.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingHearings.slice(0, 3).map((hearing) => (
                  <div key={hearing.id} className="rounded-lg border p-4 transition-colors hover:bg-accent/50">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <h3 className="font-medium">{hearing.title}</h3>
                      <Badge variant="outline" className={getStatusColor(hearing.status)}>
                        {getStatusLabel(hearing.status)}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{formatDate(hearing.date)}</span>
                      </div>
                      {hearing.location && (
                        <div className="flex items-center mt-1 text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{hearing.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Processo: {hearing.cases?.case_number || "N/A"}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/hearings/${hearing.id}`}>Ver Detalhes</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {upcomingHearings.length > 3 && (
                  <div className="flex justify-center pt-2">
                    <Button asChild variant="default">
                      <Link href="/dashboard/hearings">Ver Todas Audiências</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-orange-500" />
              Diligências Pendentes
            </CardTitle>
            <CardDescription>Diligências agendadas ou em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <p className="py-4 text-center text-muted-foreground">{error}</p>
            ) : pendingDiligences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                <p className="text-muted-foreground">Não há diligências pendentes no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDiligences.slice(0, 3).map((diligence) => (
                  <div key={diligence.id} className="rounded-lg border p-4 transition-colors hover:bg-accent/50">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <h3 className="font-medium">{diligence.task_type}</h3>
                      <Badge variant="outline" className={getStatusColor(diligence.status)}>
                        {getStatusLabel(diligence.status)}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{formatShortDate(diligence.date)}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Advogado: {diligence.attorney_name}</span>
                      </div>
                      {diligence.court && (
                        <div className="flex items-center mt-1 text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{diligence.court}</span>
                        </div>
                      )}
                    </div>
                    {diligence.case_id && (
                      <div className="mt-2 text-sm">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Processo: {diligence.cases?.case_number || "N/A"}</span>
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/diligences/${diligence.id}`}>Ver Detalhes</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingDiligences.length > 3 && (
                  <div className="flex justify-center pt-2">
                    <Button asChild variant="default">
                      <Link href="/dashboard/diligences">Ver Todas Diligências</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
