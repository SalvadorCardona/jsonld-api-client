import createJsonLdApiIri from "@/createJsonLdApiIri"
import { isApiIri } from "jsonld-item"
import { getClientConfig } from "@/config"

/**
 * Turns a resource path into a Mercure topic: the URI Template
 * `{baseUrl}{iri}/{id}` covering every item of a collection, or, with
 * `withId`, the exact topic `{baseUrl}{iri}` of one item.
 *
 * With Mercure 1.0, `clientMercure` converts the template to URL Pattern
 * syntax (`:id`) before subscribing.
 */
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
