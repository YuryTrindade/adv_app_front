import { DiligenceForm } from "@/components/diligence-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewDiligencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Diligência</h1>
        <p className="text-muted-foreground">Cadastre uma nova diligência com advogado contratado</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Diligência</CardTitle>
          <CardDescription>Preencha os dados para cadastrar uma nova diligência</CardDescription>
        </CardHeader>
        <CardContent>
          <DiligenceForm />
        </CardContent>
      </Card>
    </div>
  )
}
