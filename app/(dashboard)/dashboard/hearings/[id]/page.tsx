import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HearingForm } from "@/components/hearing-form"

interface EditHearingPageProps {
  params: {
    id: string
  }
}

export default async function EditHearingPage({ params }: EditHearingPageProps) {
  const supabase = createClient()
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
    .eq("id", params.id)
    .single()

  if (error || !hearing) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Audiência</h1>
        <p className="text-muted-foreground">Atualize as informações da audiência</p>
      </div>

      <HearingForm hearing={hearing} />
    </div>
  )
}
