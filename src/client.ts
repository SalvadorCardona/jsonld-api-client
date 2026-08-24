import createClient, { Client, ClientOptions } from "openapi-fetch"
import { apiMiddleWare } from "@/middleware"
import { getClientConfig } from "@/config"

let genericClient = createClient<Record<string, any>>({
  baseUrl: getClientConfig().baseUrl,
})
genericClient.use(apiMiddleWare)

/**
 * Builds the typed client for your OpenAPI schema and installs the middleware.
 *
 * The instance it returns also becomes the one used internally by the helpers
 * of this package, so call it once at startup:
 *
 * ```ts
 * import type { paths } from "./api-schema"
 * const client = createGenericClient<paths>({ baseUrl: getClientConfig().baseUrl })
 * ```
 */
export function createGenericClient<Paths extends object>(
  clientOptions?: ClientOptions
): Client<Paths> {
  genericClient = createClient<Paths>(
    clientOptions ?? { baseUrl: getClientConfig().baseUrl }
  )
  genericClient.use(apiMiddleWare)

  return genericClient as Client<Paths>
}

export default genericClient
