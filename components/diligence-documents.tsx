"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, Download, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Diligence } from "@/lib/types/database"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DiligenceDocumentsProps {
  diligence: Diligence
  caseId?: string
}

export function DiligenceDocuments({ diligence, caseId }: DiligenceDocumentsProps) {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-8 w-8 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileText className="h-8 w-8 text-green-500" />
      case "jpg":
      case "jpeg":
      case "png":
        return <FileText className="h-8 w-8 text-purple-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  if (!diligence.documents || diligence.documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documentos da Diligência</CardTitle>
              <CardDescription>Diligência realizada por {diligence.attorney_name}</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <a
                href={
                  caseId
                    ? `/dashboard/cases/${caseId}/diligences/${diligence.id}`
                    : `/dashboard/diligences/${diligence.id}`
                }
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FileText className="mb-2 h-16 w-16 text-muted-foreground/40" />
            <p>Nenhum documento anexado a esta diligência.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documentos da Diligência</CardTitle>
            <CardDescription>
              {diligence.documents.length} documento(s) da diligência realizada por {diligence.attorney_name}
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <a
              href={
                caseId
                  ? `/dashboard/cases/${caseId}/diligences/${diligence.id}`
                  : `/dashboard/diligences/${diligence.id}`
              }
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diligence.documents.map((document: any, index: number) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="flex items-center justify-center mb-2">{getFileIcon(document.name)}</div>
              <div className="space-y-1 text-center">
                <h3 className="font-medium truncate" title={document.name}>
                  {document.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {document.uploaded_at ? formatDate(document.uploaded_at) : "Data não disponível"}
                </p>
              </div>
              <div className="mt-4 flex justify-center">
                <Button size="sm" variant="outline" asChild>
                  <a href={document.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
