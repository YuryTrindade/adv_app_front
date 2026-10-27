"use client"

import { api } from "../api";
import type { Diligence, DiligenceInsert, DiligenceUpdate } from "../types/database";

export async function getDiligences(): Promise<{ data: Diligence[] | null; error: any }> {
  return api.get<Diligence[]>("/diligences")
}

export async function getDiligence(id: string): Promise<{ data: Diligence | null; error: any }> {
  return api.get<Diligence>(`/diligences/${id}`)
}

export async function createDiligence(
  diligenceData: Omit<DiligenceInsert, "user_id">,
): Promise<{ data: Diligence | null; error: any }> {
  return api.post<Diligence>("/diligences", diligenceData)
}

export async function updateDiligence(
  id: string,
  diligenceData: DiligenceUpdate,
): Promise<{ data: Diligence | null; error: any }> {
  return api.put<Diligence>(`/diligences/${id}`, diligenceData)
}

export async function deleteDiligence(id: string): Promise<{ error: any }> {
  const response = await api.delete<any>(`/diligences/${id}`)
  return { error: response.error }
}

export async function getPendingDiligences(): Promise<{ data: Diligence[] | null; error: any }> {
  return api.get<Diligence[]>("/diligences/pending")
}

export async function uploadDiligenceDocument(
  diligenceId: string,
  file: File,
): Promise<{ url: string | null; error: any }> {
  const formData = new FormData()
  formData.append("document", file)

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api"

    // Omitimos o Content-Type para que o browser defina automaticamente com o boundary do FormData
    const response = await fetch(`${baseUrl}/diligences/${diligenceId}/documents`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Erro ao fazer upload do documento")

    return { url: data.url, error: null }
  } catch (error) {
    console.error("Erro ao fazer upload de documento:", error)
    return { url: null, error }
  }
}