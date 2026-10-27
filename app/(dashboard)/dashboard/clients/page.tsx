import { createClient } from "@/lib/supabase/server"
import { ClientsTable } from "@/components/clients-table"

export default async function ClientsPage() {
  const supabase = createClient()
  const { data: clients } = await supabase.from("clients").select("*").order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">Gerencie seus clientes</p>
      </div>

      <ClientsTable initialClients={clients || []} />
    </div>
  )
}
