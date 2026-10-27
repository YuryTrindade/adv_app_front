"use client"

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
import { Edit, MoreHorizontal, Trash2, Plus, FileText } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Hearing } from "@/lib/types/database"
import { deleteHearing } from "@/lib/services/hearing-service"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface HearingsTableProps {
  hearings: any[]
  caseId?: string
}

export function HearingsTable({ hearings: initialHearings, caseId }: HearingsTableProps) {
  const [hearings, setHearings] = useState<any[]>(initialHearings)
  const [hearingToDelete, setHearingToDelete] = useState<Hearing | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDeleteHearing = async () => {
    if (!hearingToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await deleteHearing(hearingToDelete.id)
      if (error) {
        console.error("Erro ao excluir audiência:", error)
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir a audiência. Por favor, tente novamente.",
        })
      } else {
        setHearings(hearings.filter((h) => h.id !== hearingToDelete.id))
        toast({
          title: "Audiência excluída",
          description: "A audiência foi excluída com sucesso.",
        })
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
    } finally {
      setIsDeleting(false)
      setHearingToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Agendada
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Realizada
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Cancelada
          </Badge>
        )
      case "postponed":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Adiada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            if (caseId) {
              router.push(`/dashboard/cases/${caseId}/hearings/new`)
            } else {
              router.push("/dashboard/hearings/new")
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Audiência
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data e Hora</TableHead>
              <TableHead>Título</TableHead>
              {!caseId && <TableHead className="hidden md:table-cell">Processo</TableHead>}
              {!caseId && <TableHead className="hidden md:table-cell">Cliente</TableHead>}
              <TableHead className="hidden md:table-cell">Local</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hearings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={caseId ? 5 : 7} className="text-center">
                  Nenhuma audiência encontrada.
                </TableCell>
              </TableRow>
            ) : (
              hearings.map((hearing) => (
                <TableRow key={hearing.id}>
                  <TableCell>{formatDate(hearing.date)}</TableCell>
                  <TableCell className="font-medium">{hearing.title}</TableCell>
                  {!caseId && (
                    <TableCell className="hidden md:table-cell">{hearing.cases?.case_number || "-"}</TableCell>
                  )}
                  {!caseId && (
                    <TableCell className="hidden md:table-cell">{hearing.cases?.clients?.name || "-"}</TableCell>
                  )}
                  <TableCell className="hidden md:table-cell">{hearing.location || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{getStatusBadge(hearing.status)}</TableCell>
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
                                ? `/dashboard/cases/${caseId}/hearings/${hearing.id}`
                                : `/dashboard/hearings/${hearing.id}`
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </Link>
                        </DropdownMenuItem>
                        {!caseId && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/cases/${hearing.case_id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Ver Processo</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setHearingToDelete(hearing)}>
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

      <AlertDialog open={!!hearingToDelete} onOpenChange={(open) => !open && setHearingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a audiência "{hearingToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHearing} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
