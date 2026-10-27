"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, CheckCircle2, Upload, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getGoogleAuthUrl, disconnectGoogleCalendar } from "@/lib/services/google-calendar-service"

export default function ProfilePage() {
  const { profile, updateProfile, updateAvatar } = useAuth()
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    oab_cpf: profile?.oab_cpf || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false)
  const { toast } = useToast()

  const initials = profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}` : "U"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Aplicar máscara para telefone
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "")
      let formatted = ""

      if (cleaned.length <= 11) {
        if (cleaned.length > 2) {
          formatted += `(${cleaned.substring(0, 2)}`

          if (cleaned.length > 2) {
            formatted += `) ${cleaned.substring(2, 7)}`

            if (cleaned.length > 7) {
              formatted += `-${cleaned.substring(7, 11)}`
            }
          }
        } else {
          formatted = cleaned
        }

        setFormData({ ...formData, [name]: formatted })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await updateProfile(formData)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        })
      }
    } catch (err) {
      setError("Ocorreu um erro ao atualizar seu perfil. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const { url, error } = await updateAvatar(file)

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar avatar",
          description: error.message,
        })
      } else if (url) {
        toast({
          title: "Avatar atualizado",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar avatar",
        description: "Ocorreu um erro ao atualizar sua foto de perfil.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      const authUrl = await getGoogleAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao conectar com Google Calendar",
        description: "Ocorreu um erro ao iniciar o processo de conexão.",
      })
    }
  }

  const handleDisconnectGoogle = async () => {
    setIsDisconnectingGoogle(true)
    try {
      const { success, error } = await disconnectGoogleCalendar()

      if (success) {
        toast({
          title: "Google Calendar desconectado",
          description: "Sua conta do Google Calendar foi desconectada com sucesso.",
        })
        // Atualizar o perfil para refletir a mudança
        if (updateProfile) {
          await updateProfile({ google_calendar_connected: false })
        }
      } else {
        throw new Error(error as string)
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao desconectar Google Calendar",
        description: "Ocorreu um erro ao desconectar sua conta do Google Calendar.",
      })
    } finally {
      setIsDisconnectingGoogle(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Informações pessoais</CardTitle>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Suas informações foram atualizadas com sucesso.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nome</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Sobrenome</Label>
                  <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (Celular)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(99) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oab_cpf">Número da OAB ou CPF</Label>
                <Input id="oab_cpf" name="oab_cpf" value={formData.oab_cpf} onChange={handleChange} required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Foto de perfil</CardTitle>
              <CardDescription>Atualize sua foto de perfil</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name} />
                  <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground">
                  <Upload className="h-4 w-4" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <p className="text-sm text-muted-foreground">Clique na imagem para fazer upload de uma nova foto</p>
              {isUploading && (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2 text-sm">Enviando...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Integração com Google Calendar</CardTitle>
              <CardDescription>Sincronize suas audiências com o Google Calendar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.google_calendar_connected ? (
                <>
                  <Alert className="bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Sua conta está conectada ao Google Calendar. Suas audiências serão sincronizadas automaticamente.
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDisconnectGoogle}
                    disabled={isDisconnectingGoogle}
                  >
                    {isDisconnectingGoogle ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        <span>Desconectando...</span>
                      </div>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Desconectar Google Calendar</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Conecte sua conta do Google Calendar para sincronizar automaticamente suas audiências.
                  </p>
                  <Button className="w-full" onClick={handleConnectGoogle}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Conectar Google Calendar</span>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
