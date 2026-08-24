import { isApiIri } from "jsonld-item"
import { createJsonLdIri } from "jsonld-item"

export default function createJsonLdApiIri(resourceId: string, id?: string): string {
  if (isApiIri(resourceId)) return resourceId

  return createJsonLdIri(`/api/${resourceId}`, id)
}
