"use client"

import { api } from "../api";
import type { Client, ClientInsert, ClientUpdate } from "../types/database";

export async function getClients(): Promise<{ data: Client[] | null; error: any }> {
  return api.get<Client[]>("/clients")
}

export async function getClient(id: string): Promise<{ data: Client | null; error: any }> {
  return api.get<Client>(`/clients/${id}`)
}

export async function createClient(
  client: Omit<ClientInsert, "user_id">
): Promise<{ data: Client | null; error: any }> {
  // A API Node.js deve associar o user_id com base no token de autorização
  return api.post<Client>("/clients", client)
}

export async function updateClient(
  id: string,
  client: ClientUpdate
): Promise<{ data: Client | null; error: any }> {
  return api.put<Client>(`/clients/${id}`, client)
}

export async function deleteClient(id: string): Promise<{ error: any }> {
  const response = await api.delete<any>(`/clients/${id}`)
  return { error: response.error }
}

export async function searchClients(query: string): Promise<{ data: Client[] | null; error: any }> {
  return api.get<Client[]>(`/clients?search=${encodeURIComponent(query)}`)
}