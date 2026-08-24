import { useEffect, useMemo, useRef, useState } from "react"
import { clientMercure } from "@/mercure"

type MercureEvent = MessageEvent<string>

interface UseMercureReturn<T = any> {
  data: T | null
  error: Error | null
  isConnected: boolean
  onChange: (handler: (event: MercureEvent, parsed?: T | null) => void) => void
}

/**
 * Subscribes to one Mercure topic and re-renders when the API pushes an update.
 *
 * `data` holds the last message, parsed as JSON when possible. Pass a handler
 * to `onChange` to react to each event without waiting for a render.
 */
export function useMercure<T = any>(
  topic: string | undefined,
  disabled: boolean = true
): UseMercureReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  // Keeps a stable reference to the caller's handler
  const externalHandlerRef = useRef<
    ((event: MercureEvent, parsed?: T | null) => void) | null
  >(null)

  const onChange = useMemo(
    () => (handler: (event: MercureEvent, parsed?: T | null) => void) => {
      externalHandlerRef.current = handler
    },
    []
  )

  useEffect(() => {
    if (!topic || !disabled) return

    const eventSource = clientMercure(topic)
    setIsConnected(true)

    eventSource.onmessage = (event: MercureEvent) => {
      let parsed: T | null = null
      try {
        parsed = JSON.parse(event.data) as T
        setData(parsed)
      } catch {
        setData(event.data as unknown as T)
      }

      if (externalHandlerRef.current) {
        externalHandlerRef.current(event, parsed)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setError(new Error("Mercure connection error"))
    }

    return () => {
      setIsConnected(false)
      eventSource.close()
    }
  }, [topic, disabled])

  return { data, error, isConnected, onChange }
}
