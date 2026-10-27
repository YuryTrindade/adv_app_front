import { CaseForm } from "@/components/case-form"

export default function NewCasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Processo</h1>
        <p className="text-muted-foreground">Cadastre um novo processo jurídico</p>
      </div>

      <CaseForm />
    </div>
  )
}
