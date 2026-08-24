import createJsonLdApiIri from "@/createJsonLdApiIri"
import { isApiIri } from "jsonld-item"
import { getClientConfig } from "@/config"

export default function buildTopic(
  resourcePath: string | undefined,
  withId: boolean = false
): string | undefined {
  if (!resourcePath) return resourcePath

  if (!isApiIri(resourcePath)) {
    return ""
  }

  const uri = createJsonLdApiIri(resourcePath)

  if (withId) {
    return `${getClientConfig().baseUrl}${uri}`
  }

  return `${getClientConfig().baseUrl}${uri}/{id}`
}
