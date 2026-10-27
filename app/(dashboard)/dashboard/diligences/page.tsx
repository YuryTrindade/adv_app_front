import { createClient } from "@/lib/supabase/server"
import { DiligencesTable } from "@/components/diligences-table"

export default async function DiligencesPage() {
  const supabase = createClient()
  const { data: diligences } = await supabase
    .from("diligences")
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
    .order("date", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diligências</h1>
        <p className="text-muted-foreground">Gerencie as diligências realizadas por advogados contratados</p>
      </div>

      <DiligencesTable diligences={diligences || []} />
    </div>
  )
}
