"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, MapPin, FileText, User, Edit, Plus, Trash2 } from "lucide-react"
import {
  format,
  parseISO,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { getUpcomingHearings, deleteHearing } from "@/lib/services/hearing-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function CalendarView() {
  const [date, setDate] = useState<Date>(new Date())
  const [hearings, setHearings] = useState<any[]>([])
  const [selectedDayHearings, setSelectedDayHearings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])

  const [selectedHearing, setSelectedHearing] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const loadHearings = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await getUpcomingHearings(90) // Próximos 3 meses
        if (error) {
          console.error("Erro ao carregar audiências:", error)
          setError("Não foi possível carregar as audiências")
        } else if (data) {
          setHearings(data)
          updateSelectedDayHearings(date, data)
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
        setError("Ocorreu um erro ao carregar as audiências")
      } finally {
        setIsLoading(false)
      }
    }

    loadHearings()
  }, [])

  useEffect(() => {
    try {
      // Gerar dias do mês atual para o calendário personalizado
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)
      const days = eachDayOfInterval({ start, end })
      setCalendarDays(days)
    } catch (err) {
      console.error("Erro ao gerar dias do calendário:", err)
      setCalendarDays([])
    }
  }, [currentMonth])

  const updateSelectedDayHearings = (selectedDate: Date, hearingsList: any[] = hearings) => {
    try {
      const filteredHearings = hearingsList.filter((hearing) => {
        if (!hearing.date) return false
        const hearingDate = parseISO(hearing.date)
        return isSameDay(hearingDate, selectedDate)
      })

      // Ordenar por hora
      filteredHearings.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

      setSelectedDayHearings(filteredHearings)
    } catch (err) {
      console.error("Erro ao atualizar audiências do dia:", err)
      setSelectedDayHearings([])
    }
  }

  const handleDeleteHearing = async () => {
    if (!selectedHearing) return

    setIsDeleting(true)
    try {
      const { error } = await deleteHearing(selectedHearing.id)
      if (error) {
        console.error("Erro ao excluir audiência:", error)
        // Você pode adicionar uma notificação de erro aqui se desejar
      } else {
        // Remover a audiência excluída da lista
        const updatedHearings = hearings.filter((h) => h.id !== selectedHearing.id)
        setHearings(updatedHearings)
        updateSelectedDayHearings(date, updatedHearings)
        // Você pode adicionar uma notificação de sucesso aqui se desejar
      }
    } catch (err) {
      console.error("Erro inesperado ao excluir audiência:", err)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setSelectedHearing(null)
    }
  }

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate)
    updateSelectedDayHearings(selectedDate)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm", { locale: ptBR })
    } catch (error) {
      return ""
    }
  }

  const getHearingsForDay = (day: Date) => {
    try {
      return hearings.filter((hearing) => {
        if (!hearing.date) return false
        const hearingDate = parseISO(hearing.date)
        return isSameDay(hearingDate, day)
      })
    } catch (err) {
      console.error("Erro ao obter audiências do dia:", err)
      return []
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "postponed":
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
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendário</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>{format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendário personalizado */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="py-2 text-sm font-medium">
                  {day}
                </div>
              ))}

              {/* Dias vazios antes do primeiro dia do mês */}
              {calendarDays.length > 0 &&
                Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="h-14 rounded-md p-1" />
                ))}

              {/* Dias do mês */}
              {calendarDays.map((day) => {
                const dayHearings = getHearingsForDay(day)
                const isSelected = isSameDay(day, date)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={`h-14 rounded-md p-1 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => handleDateSelect(day)}
                  >
                    <div className="flex h-full flex-col">
                      <span className={`text-sm ${isSelected ? "font-bold" : ""}`}>{format(day, "d")}</span>
                      {dayHearings.length > 0 && (
                        <div className="mt-auto flex justify-center">
                          <Badge variant="outline" className="h-1.5 w-1.5 rounded-full p-0">
                            &nbsp;
                          </Badge>
                          {dayHearings.length > 1 && (
                            <Badge variant="outline" className="ml-0.5 h-1.5 w-1.5 rounded-full p-0">
                              &nbsp;
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Dias vazios após o último dia do mês */}
              {calendarDays.length > 0 &&
                Array.from({ length: 6 - (calendarDays[calendarDays.length - 1]?.getDay() || 0) }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="h-14 rounded-md p-1" />
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audiências do dia {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
                <CardDescription>
                  {selectedDayHearings.length === 0
                    ? "Nenhuma audiência agendada para este dia"
                    : `${selectedDayHearings.length} audiência(s) agendada(s)`}
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm", { locale: ptBR })
                  router.push(`/dashboard/hearings/new?date=${formattedDate}`)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Audiência
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>{error}</p>
              </div>
            ) : selectedDayHearings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p>Não há audiências agendadas para esta data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayHearings.map((hearing) => (
                  <div key={hearing.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{hearing.title}</h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/dashboard/hearings/${hearing.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setSelectedHearing(hearing)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{formatTime(hearing.date)}</span>
                      </div>
                      {hearing.location && (
                        <div className="flex items-center mt-1">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{hearing.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Processo: {hearing.cases?.case_number || "N/A"}</span>
                      </div>
                    </div>
                    <div className="mt-1 text-sm">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Cliente: {hearing.cases?.clients?.name || "N/A"}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`mt-2 ${getStatusColor(hearing.status)}`}>
                      {getStatusLabel(hearing.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Audiências</CardTitle>
          <CardDescription>Audiências agendadas para os próximos dias</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
              <p>{error}</p>
            </div>
          ) : hearings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
              <p>Não há audiências agendadas para os próximos dias.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hearings.slice(0, 6).map((hearing) => (
                  <div
                    key={hearing.id}
                    className="rounded-lg border p-4 hover:bg-accent cursor-pointer"
                    onClick={() => router.push(`/dashboard/hearings/${hearing.id}`)}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{hearing.title}</h3>
                        <Badge variant="outline" className={getStatusColor(hearing.status)}>
                          {getStatusLabel(hearing.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{format(parseISO(hearing.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        </div>
                      </div>
                      <div className="mt-1 text-sm truncate">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Processo: {hearing.cases?.case_number || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hearings.length > 6 && (
                <div className="flex justify-center pt-2">
                  <Button onClick={() => router.push("/dashboard/hearings")}>Ver Todas as Audiências</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a audiência "{selectedHearing?.title}"?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHearing}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
