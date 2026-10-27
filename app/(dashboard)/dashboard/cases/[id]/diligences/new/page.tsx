import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DiligenceForm } from "@/components/diligence-form"

interface NewCaseDiligencePageProps {
  params: {
    id: string
  }
}

export default async function NewCaseDiligencePage({ params }: NewCaseDiligencePageProps) {
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
        <h1 className="text-3xl font-bold tracking-tight">Nova Diligência</h1>
        <p className="text-muted-foreground">Cadastre uma nova diligência para o processo {caseData.case_number}</p>
      </div>

      <DiligenceForm caseId={params.id} />
    </div>
  )
}
