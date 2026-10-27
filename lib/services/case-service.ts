"use client"

import { api } from "../api";
import type { Case, CaseInsert, CaseUpdate } from "../types/database";

export async function getCases(): Promise<{ data: Case[] | null; error: any }> {
  return api.get<Case[]>("/cases")
}

export async function getCase(id: string): Promise<{ data: Case | null; error: any }> {
  return api.get<Case>(`/cases/${id}`)
}

export async function createCase(caseData: Omit<CaseInsert, "user_id">): Promise<{ data: Case | null; error: any }> {
  return api.post<Case>("/cases", caseData)
}

export async function updateCase(id: string, caseData: CaseUpdate): Promise<{ data: Case | null; error: any }> {
  return api.put<Case>(`/cases/${id}`, caseData)
}

export async function deleteCase(id: string): Promise<{ error: any }> {
  const response = await api.delete<any>(`/cases/${id}`)
  return { error: response.error }
}

export async function searchCases(query: string): Promise<{ data: Case[] | null; error: any }> {
  return api.get<Case[]>(`/cases?search=${encodeURIComponent(query)}`)
}