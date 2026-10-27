"use client"

import { api } from "../api"

export async function getGoogleAuthUrl() {
  try {
    // A API Node.js deve gerar e retornar a URL de autorização do Google
    const { data, error } = await api.get<{ url: string }>("/calendar/auth-url")
    if (error || !data) throw new Error("Falha ao obter URL de autenticação")

    return data.url
  } catch (error) {
    console.error("Erro ao obter URL do Google:", error)
    throw error
  }
}

export async function handleGoogleCallback(code: string) {
  try {
    // O backend processa o código, obtém os tokens e salva na base de dados
    const { error } = await api.post("/calendar/callback", { code })

    if (error) {
      throw new Error(error.message || "Falha ao processar callback do Google")
    }

    return { success: true }
  } catch (error) {
    console.error("Erro na autenticação do Google:", error)
    return { success: false, error }
  }
}

export async function addEventToGoogleCalendar(hearing: any) {
  try {
    // O backend recupera os tokens do utilizador e cria o evento na API do Google
    const { data, error } = await api.post<{ eventId: string }>(`/hearings/${hearing.id}/calendar`, {})

    if (error) {
      throw new Error(error.message || "Falha ao criar evento no Google Calendar")
    }

    return { success: true, eventId: data?.eventId }
  } catch (error) {
    console.error("Erro ao adicionar evento ao Google Calendar:", error)
    return { success: false, error }
  }
}

export async function disconnectGoogleCalendar() {
  try {
    // O backend apaga os tokens associados ao perfil do utilizador
    const { error } = await api.post("/calendar/disconnect", {})

    if (error) {
      throw new Error(error.message || "Falha ao desconectar Google Calendar")
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao desconectar Google Calendar:", error)
    return { success: false, error }
  }
}