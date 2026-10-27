import { DatabaseConnectionTest } from "@/components/database-connection-test"

export default function TestConnectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teste de Conexão</h1>
        <p className="text-muted-foreground">Verifique a conexão com o banco de dados e diagnostique problemas</p>
      </div>

      <DatabaseConnectionTest />
    </div>
  )
}
