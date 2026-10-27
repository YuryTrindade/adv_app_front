import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HearingForm } from "@/components/hearing-form"

interface EditCaseHearingPageProps {
  params: {
    id: string
    hearingId: string
  }
}

export default async function EditCaseHearingPage({ params }: EditCaseHearingPageProps) {
  const supabase = createClient()

  // Buscar a audiência
  const { data: hearing, error } = await supabase
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
    .eq("id", params.hearingId)
    .eq("case_id", params.id)
    .single()

  if (error || !hearing) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Audiência</h1>
        <p className="text-muted-foreground">
          Atualize as informações da audiência do processo {hearing.cases?.case_number}
        </p>
      </div>

      <HearingForm hearing={hearing} caseId={params.id} />
    </div>
  )
}
