"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

type RealtimeListenerProps = {
  channelName: string
  tables: string[]
}

export function RealtimeListener({ channelName, tables }: RealtimeListenerProps) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(channelName)

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          router.refresh()
        },
      )
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, router, tables])

  return null
}
