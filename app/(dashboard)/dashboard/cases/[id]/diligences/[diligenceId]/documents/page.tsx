import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DiligenceDocuments } from "@/components/diligence-documents"

interface CaseDiligenceDocumentsPageProps {
  params: {
    id: string
    diligenceId: string
  }
}

export default async function CaseDiligenceDocumentsPage({ params }: CaseDiligenceDocumentsPageProps) {
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
    .eq("id", params.diligenceId)
    .eq("case_id", params.id)
    .single()

  if (error || !diligence) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos da Diligência</h1>
        <p className="text-muted-foreground">
          Visualize os documentos anexados à diligência do processo {diligence.cases?.case_number}
        </p>
      </div>

      <DiligenceDocuments diligence={diligence} caseId={params.id} />
    </div>
  )
}
