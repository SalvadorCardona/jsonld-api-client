import { getClientConfig } from "@/config"

/** A URI Template variable, as `buildTopic()` produces: `{id}`. */
const URI_TEMPLATE_VARIABLE = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g

/** A URL Pattern named group in a path segment: `/:id`. */
const URL_PATTERN_GROUP = /\/:[A-Za-z_]/

/**
 * Turns a URI Template (`https://example.com/books/{id}`) into the WHATWG URL
 * Pattern syntax that Mercure 1.0 expects (`https://example.com/books/:id`).
 */
export function uriTemplateToUrlPattern(topic: string): string {
  return topic.replace(URI_TEMPLATE_VARIABLE, ":$1")
}

/**
 * Tells a topic pattern from an exact topic: a URI Template variable (`{id}`)
 * or a URL Pattern group (`/:id`) makes it a pattern.
 */
export function isTopicPattern(topic: string): boolean {
  return uriTemplateToUrlPattern(topic) !== topic || URL_PATTERN_GROUP.test(topic)
}

/**
 * Builds the subscription URL of the Mercure hub for one topic.
 *
 * - `1.0`: `match=` for an exact topic, `match_urlpattern=` for a pattern,
 *   whose URI Template variables become URL Pattern groups;
 * - `0.x`: `topic=`, the topic passed as is.
 */
export function buildMercureUrl(topic: string): URL {
  const { baseUrl, mercurePath, mercureProtocol } = getClientConfig()
  const url = new URL(baseUrl + mercurePath)

  if (mercureProtocol === "0.x") {
    url.searchParams.append("topic", topic)
  } else if (isTopicPattern(topic)) {
    url.searchParams.append("match_urlpattern", uriTemplateToUrlPattern(topic))
  } else {
    url.searchParams.append("match", topic)
  }

  return url
}

/**
 * Opens an EventSource on the Mercure hub for one topic, so the caller
 * receives updates pushed by the API.
 *
 * With Mercure 1.0 the browser presents its token through the hub's cookie,
 * so the EventSource sends credentials, even when the hub is on another origin.
 */
export function clientMercure(topic: string): EventSource {
  const withCredentials = getClientConfig().mercureProtocol !== "0.x"

  return new EventSource(buildMercureUrl(topic), { withCredentials })
}
