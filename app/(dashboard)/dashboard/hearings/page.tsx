import { createClient } from "@/lib/supabase/server"
import { HearingsTable } from "@/components/hearings-table"

export default async function HearingsPage() {
  const supabase = createClient()
  const { data: hearings } = await supabase
    .from("hearings")
    .select(`
      *,
      cases (
        id,
        case_number,
        clients (
          id,
          name
        )
      )
    `)
    .order("date", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audiências</h1>
        <p className="text-muted-foreground">Gerencie suas audiências</p>
      </div>

      <HearingsTable hearings={hearings || []} />
    </div>
  )
}
