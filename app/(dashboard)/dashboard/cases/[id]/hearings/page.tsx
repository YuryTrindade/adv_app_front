import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { HearingsTable } from "@/components/hearings-table"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface CaseHearingsPageProps {
  params: {
    id: string
  }
}

export default async function CaseHearingsPage({ params }: CaseHearingsPageProps) {
  const supabase = createClient()

  // Buscar o processo
  const { data: caseData, error: caseError } = await supabase
    .from("cases")
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .eq("id", params.id)
    .single()

  if (caseError || !caseData) {
    notFound()
  }

  // Buscar as audiências do processo
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
    .eq("case_id", params.id)
    .order("date", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audiências do Processo</h1>
          <p className="text-muted-foreground">
            Processo: {caseData.case_number} | Cliente: {caseData.clients?.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/cases/${params.id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar ao Processo
          </Link>
        </Button>
      </div>

      <HearingsTable hearings={hearings || []} caseId={params.id} />
    </div>
  )
}
