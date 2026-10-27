import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DiligenceForm } from "@/components/diligence-form"

interface EditDiligencePageProps {
  params: {
    id: string
  }
}

export default async function EditDiligencePage({ params }: EditDiligencePageProps) {
  const supabase = createClient()
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
    .eq("id", params.id)
    .single()

  if (error || !diligence) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Diligência</h1>
        <p className="text-muted-foreground">Atualize as informações da diligência</p>
      </div>

      <DiligenceForm diligence={diligence} />
    </div>
  )
}
