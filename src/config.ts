const isBrowser = (): boolean => typeof window !== "undefined"

/**
 * What the client needs from the application hosting it.
 *
 * The package knows how to talk to a JSON-LD API, not which one, nor who is
 * signed in. Both come from here, set once at startup through
 * {@link configureClient}. Every setting has a default, so the client works
 * unconfigured against a same-origin API.
 */
export interface ClientConfigInterface {
  /** Root URL of the API. Defaults to the current origin in the browser. */
  baseUrl: string

  /**
   * Bearer token attached to every request, or `undefined` when nobody is
   * signed in. The client stays unaware of how the session is stored:
   *
   * ```ts
   * import { isLogged, getUserToken } from "react-jwt-session"
   * configureClient({ getAuthToken: () => (isLogged() ? getUserToken() : undefined) })
   * ```
   */
  getAuthToken: () => string | undefined

  /**
   * Value of the `X-Scope` header, when the API segments its responses by
   * scope. Returning `undefined` leaves the header out.
   */
  getScope: () => string | undefined

  /** Path of the Mercure hub, appended to `baseUrl`. */
  mercurePath: string

  /**
   * Version of the Mercure protocol spoken by the hub.
   *
   * - `"1.0"` (default, hubs v1.0+, FrankenPHP 1.13+): subscribes with
   *   `match=` / `match_urlpattern=` and sends the hub's cookie
   *   (`withCredentials`), the token no longer travelling in the URL;
   * - `"0.x"`: subscribes with `topic=` and URI Templates, as before.
   */
  mercureProtocol: MercureProtocol
}

export type MercureProtocol = "0.x" | "1.0"

let config: ClientConfigInterface = {
  baseUrl: isBrowser() ? window.origin : "http://localhost",
  getAuthToken: () => undefined,
  getScope: () => undefined,
  mercurePath: "/.well-known/mercure",
  mercureProtocol: "1.0",
}

export function getClientConfig(): ClientConfigInterface {
  return config
}

/**
 * Wires the client to the host application. Call it before the first request.
 *
 * @example
 * configureClient({
 *   baseUrl: "https://api.example.com",
 *   getAuthToken: () => (isLogged() ? getUserToken() : undefined),
 *   getScope: () => getCurrentScope(),
 * })
 */
export function configureClient(newConfig: Partial<ClientConfigInterface>): void {
  config = { ...config, ...newConfig }
}
