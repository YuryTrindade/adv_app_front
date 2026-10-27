import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { CaseForm } from "@/components/case-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Briefcase } from "lucide-react"

interface EditCasePageProps {
  params: {
    id: string
  }
}

export default async function EditCasePage({ params }: EditCasePageProps) {
  const supabase = createClient()
  const { data: caseData, error } = await supabase
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

  if (error || !caseData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Processo</h1>
        <p className="text-muted-foreground">Atualize as informações do processo</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <CaseForm caseData={caseData} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>Ações relacionadas a este processo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild variant="outline" size="lg" className="w-full justify-start">
                <Link href={`/dashboard/cases/${params.id}/hearings`}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Gerenciar Audiências
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full justify-start">
                <Link href={`/dashboard/cases/${params.id}/diligences`}>
                  <Briefcase className="mr-2 h-5 w-5" />
                  Gerenciar Diligências
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
