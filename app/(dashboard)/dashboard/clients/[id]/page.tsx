import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientForm } from "@/components/client-form"

interface EditClientPageProps {
  params: {
    id: string
  }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const supabase = createClient()
  const { data: client, error } = await supabase.from("clients").select("*").eq("id", params.id).single()

  if (error || !client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
        <p className="text-muted-foreground">Atualize as informações do cliente</p>
      </div>

      <ClientForm client={client} />
    </div>
  )
}
