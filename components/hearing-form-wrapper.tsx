"use client"

import { HearingForm } from "@/components/hearing-form"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export function HearingFormWrapper() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const initialDate = searchParams.get("date") || ""

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const { data: user } = await supabase.auth.getUser()

      if (user?.user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("google_calendar_connected")
          .eq("id", user.user.id)
          .single()

        setProfile(data)
      }

      setIsLoading(false)
    }

    fetchProfile()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Audiência</h1>
          <p className="text-muted-foreground">Cadastre uma nova audiência</p>
        </div>

        {profile && !profile.google_calendar_connected && (
          <Button variant="outline" asChild>
            <Link href="/dashboard/profile">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Conectar Google Calendar</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <HearingForm initialDate={initialDate} />
    </div>
  )
}
