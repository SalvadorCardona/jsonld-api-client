import { getClientConfig } from "@/config"

/**
 * Opens an EventSource on the Mercure hub for one topic, so the caller
 * receives updates pushed by the API.
 */
export function clientMercure(topic: string): EventSource {
  const { baseUrl, mercurePath } = getClientConfig()
  const url = new URL(baseUrl + mercurePath)
  url.searchParams.append("topic", topic)

  return new EventSource(url)
}
