"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Edit, MoreHorizontal, Search, Trash2, Plus, FileText, Download } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Diligence } from "@/lib/types/database"
import { deleteDiligence } from "@/lib/services/diligence-service"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface DiligencesTableProps {
  diligences: any[]
  caseId?: string
}

export function DiligencesTable({ diligences: initialDiligences, caseId }: DiligencesTableProps) {
  const [diligences, setDiligences] = useState<any[]>(initialDiligences)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [diligenceToDelete, setDiligenceToDelete] = useState<Diligence | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = () => {
    if (!searchQuery) {
      setDiligences(initialDiligences)
      return
    }

    setIsSearching(true)
    try {
      const filtered = initialDiligences.filter(
        (diligence) =>
          diligence.attorney_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          diligence.court?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          diligence.task_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          diligence.cases?.case_number.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setDiligences(filtered)
    } catch (err) {
      console.error("Erro na busca:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleDeleteDiligence = async () => {
    if (!diligenceToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await deleteDiligence(diligenceToDelete.id)
      if (error) {
        console.error("Erro ao excluir diligência:", error)
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir a diligência. Por favor, tente novamente.",
        })
      } else {
        setDiligences(diligences.filter((d) => d.id !== diligenceToDelete.id))
        toast({
          title: "Diligência excluída",
          description: "A diligência foi excluída com sucesso.",
        })
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
    } finally {
      setIsDeleting(false)
      setDiligenceToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendada":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Agendada
          </Badge>
        )
      case "em_andamento":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Em andamento
          </Badge>
        )
      case "concluida":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Concluída
          </Badge>
        )
      case "cancelada":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Buscar diligência..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <Button type="button" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Buscar</span>
          </Button>
        </div>
        <Button
          onClick={() => {
            if (caseId) {
              router.push(`/dashboard/cases/${caseId}/diligences/new`)
            } else {
              router.push("/dashboard/diligences/new")
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Diligência
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Advogado</TableHead>
              {!caseId && <TableHead className="hidden md:table-cell">Processo</TableHead>}
              <TableHead className="hidden md:table-cell">Fórum</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diligences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={caseId ? 6 : 7} className="text-center">
                  Nenhuma diligência encontrada.
                </TableCell>
              </TableRow>
            ) : (
              diligences.map((diligence) => (
                <TableRow key={diligence.id}>
                  <TableCell>{formatDate(diligence.date)}</TableCell>
                  <TableCell className="font-medium">{diligence.attorney_name}</TableCell>
                  {!caseId && (
                    <TableCell className="hidden md:table-cell">{diligence.cases?.case_number || "N/A"}</TableCell>
                  )}
                  <TableCell className="hidden md:table-cell">{diligence.court || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{diligence.task_type}</TableCell>
                  <TableCell className="hidden lg:table-cell">{getStatusBadge(diligence.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={
                              caseId
                                ? `/dashboard/cases/${caseId}/diligences/${diligence.id}`
                                : `/dashboard/diligences/${diligence.id}`
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </Link>
                        </DropdownMenuItem>
                        {!caseId && diligence.case_id && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/cases/${diligence.case_id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Ver Processo</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {diligence.documents && diligence.documents.length > 0 && (
                          <DropdownMenuItem asChild>
                            <Link
                              href={
                                caseId
                                  ? `/dashboard/cases/${caseId}/diligences/${diligence.id}/documents`
                                  : `/dashboard/diligences/${diligence.id}/documents`
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              <span>Documentos ({diligence.documents.length})</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setDiligenceToDelete(diligence)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!diligenceToDelete} onOpenChange={(open) => !open && setDiligenceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a diligência do advogado "{diligenceToDelete?.attorney_name}"? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDiligence} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
