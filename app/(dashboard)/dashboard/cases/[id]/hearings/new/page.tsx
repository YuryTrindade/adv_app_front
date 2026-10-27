import { HearingForm } from "@/components/hearing-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface NewCaseHearingPageProps {
  params: {
    id: string
  }
}

export default async function NewCaseHearingPage({ params }: NewCaseHearingPageProps) {
  const supabase = createClient()

  // Verificar se o processo existe
  const { data: caseData, error: caseError } = await supabase
    .from("cases")
    .select("id, case_number")
    .eq("id", params.id)
    .single()

  if (caseError || !caseData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Audiência</h1>
        <p className="text-muted-foreground">Cadastre uma nova audiência para o processo {caseData.case_number}</p>
      </div>

      <HearingForm caseId={params.id} />
    </div>
  )
}
