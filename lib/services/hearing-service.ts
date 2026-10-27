"use client"

import { api } from "../api";
import type { Hearing, HearingInsert, HearingUpdate } from "../types/database";

export async function getHearings(): Promise<{ data: Hearing[] | null; error: any }> {
  return api.get<Hearing[]>("/hearings")
}

export async function getHearing(id: string): Promise<{ data: Hearing | null; error: any }> {
  return api.get<Hearing>(`/hearings/${id}`)
}

export async function createHearing(
  hearingData: Omit<HearingInsert, "user_id">,
): Promise<{ data: Hearing | null; error: any }> {
  // A API Node.js é responsável por associar o user_id do token autenticado
  return api.post<Hearing>("/hearings", hearingData)
}

export async function updateHearing(
  id: string,
  hearingData: HearingUpdate,
): Promise<{ data: Hearing | null; error: any }> {
  return api.put<Hearing>(`/hearings/${id}`, hearingData)
}

export async function deleteHearing(id: string): Promise<{ error: any }> {
  const response = await api.delete<any>(`/hearings/${id}`)
  return { error: response.error }
}

export async function getUpcomingHearings(days = 30): Promise<{ data: Hearing[] | null; error: any }> {
  return api.get<Hearing[]>(`/hearings/upcoming?days=${days}`)
}