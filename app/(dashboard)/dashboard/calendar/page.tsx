import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendário de Audiências</h1>
        <p className="text-muted-foreground">Visualize suas audiências agendadas</p>
      </div>

      <CalendarView />
    </div>
  )
}
