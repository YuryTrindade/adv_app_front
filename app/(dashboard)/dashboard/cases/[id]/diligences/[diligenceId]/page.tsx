import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DiligenceForm } from "@/components/diligence-form"

interface EditCaseDiligencePageProps {
  params: {
    id: string
    diligenceId: string
  }
}

export default async function EditCaseDiligencePage({ params }: EditCaseDiligencePageProps) {
  const supabase = createClient()

  // Buscar a diligência
  const { data: diligence, error } = await supabase
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
    .eq("id", params.diligenceId)
    .eq("case_id", params.id)
    .single()

  if (error || !diligence) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Diligência</h1>
        <p className="text-muted-foreground">
          Atualize as informações da diligência do processo {diligence.cases?.case_number}
        </p>
      </div>

      <DiligenceForm diligence={diligence} caseId={params.id} />
    </div>
  )
}
