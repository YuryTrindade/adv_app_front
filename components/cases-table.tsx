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
import { Edit, MoreHorizontal, Search, Trash2, Plus, Calendar } from "lucide-react"
import type { Case } from "@/lib/types/database"
import { deleteCase, searchCases } from "@/lib/services/case-service"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface CasesTableProps {
  initialCases: any[]
}

export function CasesTable({ initialCases }: CasesTableProps) {
  const [cases, setCases] = useState<any[]>(initialCases)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCases(initialCases)
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await searchCases(searchQuery)
      if (error) {
        console.error("Erro ao buscar processos:", error)
        toast({
          variant: "destructive",
          title: "Erro na busca",
          description: "Ocorreu um erro ao buscar processos. Por favor, tente novamente.",
        })
      } else {
        setCases(data || [])
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleDeleteCase = async () => {
    if (!caseToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await deleteCase(caseToDelete.id)
      if (error) {
        console.error("Erro ao excluir processo:", error)
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir o processo. Por favor, tente novamente.",
        })
      } else {
        setCases(cases.filter((c) => c.id !== caseToDelete.id))
        toast({
          title: "Processo excluído",
          description: "O processo foi excluído com sucesso.",
        })
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
    } finally {
      setIsDeleting(false)
      setCaseToDelete(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em andamento":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Concluído":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Arquivado":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case "Suspenso":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Recurso":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Aguardando julgamento":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Aguardando documentação":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Buscar processo..."
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
        <Button onClick={() => router.push("/dashboard/cases/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número do Processo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Assunto</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum processo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                  <TableCell>{caseItem.clients?.name || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{caseItem.type}</TableCell>
                  <TableCell className="hidden md:table-cell">{caseItem.subject}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge className={getStatusColor(caseItem.status)} variant="outline">
                      {caseItem.status}
                    </Badge>
                  </TableCell>
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
                          <Link href={`/dashboard/cases/${caseItem.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/cases/${caseItem.id}/hearings`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Audiências</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCaseToDelete(caseItem)}>
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

      <AlertDialog open={!!caseToDelete} onOpenChange={(open) => !open && setCaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o processo {caseToDelete?.case_number}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCase} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
