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
import { Edit, MoreHorizontal, Search, Trash2, UserPlus } from "lucide-react"
import type { Client } from "@/lib/types/database"
import { deleteClient, searchClients } from "@/lib/services/client-service"
import { useToast } from "@/hooks/use-toast"

interface ClientsTableProps {
  initialClients: Client[]
}

export function ClientsTable({ initialClients }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setClients(initialClients)
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await searchClients(searchQuery)
      if (error) {
        console.error("Erro ao buscar clientes:", error)
        toast({
          variant: "destructive",
          title: "Erro na busca",
          description: "Ocorreu um erro ao buscar clientes. Por favor, tente novamente.",
        })
      } else {
        setClients(data || [])
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

  const handleDeleteClient = async () => {
    if (!clientToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await deleteClient(clientToDelete.id)
      if (error) {
        console.error("Erro ao excluir cliente:", error)
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir o cliente. Por favor, tente novamente.",
        })
      } else {
        setClients(clients.filter((client) => client.id !== clientToDelete.id))
        toast({
          title: "Cliente excluído",
          description: "O cliente foi excluído com sucesso.",
        })
      }
    } catch (err) {
      console.error("Erro inesperado:", err)
    } finally {
      setIsDeleting(false)
      setClientToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Buscar cliente..."
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
        <Button onClick={() => router.push("/dashboard/clients/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="hidden lg:table-cell">CPF/CNPJ</TableHead>
              <TableHead className="hidden lg:table-cell">Cidade/UF</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.email || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.phone || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{client.cpf_cnpj || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {client.city && client.state ? `${client.city}/${client.state}` : "-"}
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
                          <Link href={`/dashboard/clients/${client.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setClientToDelete(client)}>
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

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente {clientToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
