import { createClient } from "@/lib/supabase/server"
import { CasesTable } from "@/components/cases-table"

export default async function CasesPage() {
  const supabase = createClient()
  const { data: cases } = await supabase
    .from("cases")
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Processos</h1>
        <p className="text-muted-foreground">Gerencie seus processos jurídicos</p>
      </div>

      <CasesTable initialCases={cases || []} />
    </div>
  )
}
