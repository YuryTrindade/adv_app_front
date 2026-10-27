import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DiligenceDocuments } from "@/components/diligence-documents"

interface DiligenceDocumentsPageProps {
  params: {
    id: string
  }
}

export default async function DiligenceDocumentsPage({ params }: DiligenceDocumentsPageProps) {
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
        <h1 className="text-3xl font-bold tracking-tight">Documentos da Diligência</h1>
        <p className="text-muted-foreground">Visualize os documentos anexados à diligência</p>
      </div>

      <DiligenceDocuments diligence={diligence} />
    </div>
  )
}
