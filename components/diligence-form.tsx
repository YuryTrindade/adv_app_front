"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, File } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Diligence, Case } from "@/lib/types/database"
import { createDiligence, updateDiligence, uploadDiligenceDocument } from "@/lib/services/diligence-service"
import { getCases } from "@/lib/services/case-service"
import { useToast } from "@/hooks/use-toast"

interface DiligenceFormProps {
  diligence?: Diligence
  caseId?: string
  onSuccess?: () => void
}

export function DiligenceForm({ diligence, caseId, onSuccess }: DiligenceFormProps) {
  const [formData, setFormData] = useState({
    case_id: "",
    attorney_name: "",
    attorney_oab: "",
    attorney_phone: "",
    attorney_email: "",
    date: "",
    court: "",
    task_type: "",
    task_description: "",
    fee_amount: "",
    status: "agendada",
    outcome: "",
  })
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCases, setIsLoadingCases] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  // Carregar a lista de processos
  useEffect(() => {
    const loadCases = async () => {
      try {
        const { data, error } = await getCases()
        if (error) {
          console.error("Erro ao carregar processos:", error)
        } else if (data) {
          setCases(data)
        }
      } catch (err) {
        console.error("Erro ao carregar processos:", err)
      } finally {
        setIsLoadingCases(false)
      }
    }

    loadCases()
  }, [])

  // Preencher os dados para edição
  useEffect(() => {
    if (diligence) {
      setFormData({
        case_id: diligence.case_id || "",
        attorney_name: diligence.attorney_name || "",
        attorney_oab: diligence.attorney_oab || "",
        attorney_phone: diligence.attorney_phone || "",
        attorney_email: diligence.attorney_email || "",
        date: diligence.date ? diligence.date.split("T")[0] : "",
        court: diligence.court || "",
        task_type: diligence.task_type || "",
        task_description: diligence.task_description || "",
        fee_amount: diligence.fee_amount?.toString() || "",
        status: diligence.status || "agendada",
        outcome: diligence.outcome || "",
      })
    } else if (caseId) {
      setFormData({
        ...formData,
        case_id: caseId,
      })
    }
  }, [diligence, caseId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Processar o valor monetário
      const processedData = {
        ...formData,
        fee_amount: formData.fee_amount ? Number.parseFloat(formData.fee_amount) : null,
      }

      let diligenceResult

      if (diligence) {
        // Atualizar diligência existente
        const { data, error } = await updateDiligence(diligence.id, processedData)
        if (error) {
          console.error("Erro ao atualizar diligência:", error)
          setError("Ocorreu um erro ao atualizar a diligência. Por favor, tente novamente.")
          setIsLoading(false)
          return
        }
        diligenceResult = data
        setSuccess("Diligência atualizada com sucesso!")
      } else {
        // Criar nova diligência
        const { data, error } = await createDiligence(processedData)
        if (error) {
          console.error("Erro ao criar diligência:", error)
          setError("Ocorreu um erro ao criar a diligência. Por favor, tente novamente.")
          setIsLoading(false)
          return
        }
        diligenceResult = data
        setSuccess("Diligência criada com sucesso!")
      }

      // Upload de arquivos se tiver arquivos selecionados
      if (selectedFiles.length > 0 && diligenceResult) {
        setIsUploading(true)
        let successCount = 0

        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(Math.round((i / selectedFiles.length) * 100))

          const { url, error } = await uploadDiligenceDocument(diligenceResult.id, selectedFiles[i])

          if (error) {
            console.error("Erro ao fazer upload do arquivo:", error)
            toast({
              variant: "warning",
              title: "Erro no upload",
              description: `Erro ao enviar o arquivo ${selectedFiles[i].name}`,
            })
          } else {
            successCount++
          }
        }

        setUploadProgress(100)

        if (successCount > 0) {
          toast({
            title: "Upload concluído",
            description: `${successCount} de ${selectedFiles.length} arquivos enviados com sucesso.`,
          })
        }
      }

      // Redirecionar ou chamar callback de sucesso
      if (onSuccess) {
        onSuccess()
      } else {
        setTimeout(() => {
          if (caseId) {
            router.push(`/dashboard/cases/${caseId}/diligences`)
          } else {
            router.push("/dashboard/diligences")
          }
        }, 1000)
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
      setIsUploading(false)
    }
  }

  const taskTypes = [
    "Verificação de Processo",
    "Cópia de Processo",
    "Sustentação Oral",
    "Despacho com Juiz",
    "Audiência de Conciliação",
    "Protocolo de Documento",
    "Outro",
  ]

  const diligenceStatuses = [
    { value: "agendada", label: "Agendada" },
    { value: "em_andamento", label: "Em andamento" },
    { value: "concluida", label: "Concluída" },
    { value: "cancelada", label: "Cancelada" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="case_id">Processo Relacionado</Label>
        <Select
          value={formData.case_id}
          onValueChange={(value) => handleSelectChange("case_id", value)}
          disabled={isLoadingCases || !!caseId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um processo (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Nenhum --</SelectItem>
            {isLoadingCases ? (
              <SelectItem value="loading" disabled>
                Carregando processos...
              </SelectItem>
            ) : cases.length === 0 ? (
              <SelectItem value="empty" disabled>
                Nenhum processo cadastrado
              </SelectItem>
            ) : (
              cases.map((caseItem) => (
                <SelectItem key={caseItem.id} value={caseItem.id}>
                  {caseItem.case_number} - {caseItem.clients?.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="attorney_name">Nome do Advogado *</Label>
          <Input
            id="attorney_name"
            name="attorney_name"
            value={formData.attorney_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attorney_oab">Número da OAB *</Label>
          <Input id="attorney_oab" name="attorney_oab" value={formData.attorney_oab} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="attorney_phone">Telefone do Advogado *</Label>
          <Input
            id="attorney_phone"
            name="attorney_phone"
            value={formData.attorney_phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attorney_email">Email do Advogado</Label>
          <Input
            id="attorney_email"
            name="attorney_email"
            type="email"
            value={formData.attorney_email}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Data da Diligência *</Label>
          <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="court">Fórum/Local</Label>
          <Input id="court" name="court" value={formData.court} onChange={handleChange} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task_type">Tipo de Diligência *</Label>
          <Select value={formData.task_type} onValueChange={(value) => handleSelectChange("task_type", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {diligenceStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task_description">Descrição da Diligência *</Label>
        <Textarea
          id="task_description"
          name="task_description"
          rows={3}
          value={formData.task_description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fee_amount">Valor dos Honorários (R$)</Label>
        <Input
          id="fee_amount"
          name="fee_amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.fee_amount}
          onChange={handleChange}
        />
      </div>

      {formData.status === "concluida" && (
        <div className="space-y-2">
          <Label htmlFor="outcome">Resultado da Diligência</Label>
          <Textarea id="outcome" name="outcome" rows={3} value={formData.outcome} onChange={handleChange} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="documents">Anexar Documentos</Label>
        <div className="flex items-center gap-2">
          <Input id="documents" type="file" multiple onChange={handleFileChange} className="cursor-pointer" />
          {selectedFiles.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <File className="mr-1 h-4 w-4" />
              {selectedFiles.length} arquivo(s) selecionado(s)
            </div>
          )}
        </div>
        {isUploading && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Enviando arquivos...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (caseId) {
              router.push(`/dashboard/cases/${caseId}/diligences`)
            } else {
              router.push("/dashboard/diligences")
            }
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading ? "Salvando..." : diligence ? "Atualizar Diligência" : "Cadastrar Diligência"}
        </Button>
      </div>
    </form>
  )
}
