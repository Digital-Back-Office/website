/**
 * Shared access to the live event schedule: one fetch, one cache, used both by
 * the events page (src/scripts/eventbrite-live.js) and by the site-wide
 * warm-up (src/scripts/events-prefetch.js).
 *
 * The webhook takes a couple of seconds to answer, which used to leave the
 * events page showing its "nothing on the calendar" state until the response
 * landed. Caching the payload in localStorage lets the page paint the last
 * known schedule immediately and swap in fresh data once it arrives.
 */

const WEBHOOK_URL = import.meta.env.PUBLIC_EVENTBRITE_WEBHOOK_URL;
const FETCH_TIMEOUT_MS = 8000;

export const EVENTS_CACHE_KEY = "dbo:events-feed:v1";

/**
 * A cached schedule is only ever a placeholder for the fetch that is already
 * in flight behind it, so this window just has to be short enough that nobody
 * is shown an event that has since happened. Past that age the page waits for
 * the network rather than paint something stale.
 */
const CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * Storage can throw rather than return null — Safari in private mode, blocked
 * third-party storage, a full quota — and none of that is worth breaking the
 * page over, so every access here fails quietly back to "no cache".
 */
export function readCachedFeed() {
  try {
    const raw = window.localStorage.getItem(EVENTS_CACHE_KEY);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (!entry || typeof entry.savedAt !== "number") return null;
    if (!entry.data || typeof entry.data !== "object") return null;
    if (Date.now() - entry.savedAt > CACHE_MAX_AGE_MS) return null;

    return entry.data;
  } catch (error) {
    return null;
  }
}

export function writeCachedFeed(data) {
  try {
    window.localStorage.setItem(
      EVENTS_CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), data })
    );
  } catch (error) {
    /* Nothing to do: the page works without a cache, just slower. */
  }
}

/**
 * Resolves to the schedule and refreshes the cache, or null when no webhook is
 * configured. Network, HTTP and parse failures throw so the caller can decide
 * what to show — cached data usually, the empty state otherwise.
 */
export async function fetchFeed() {
  if (!WEBHOOK_URL) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(WEBHOOK_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`webhook responded ${response.status}`);

    const data = await response.json();
    if (!data || typeof data !== "object") {
      throw new Error("webhook returned a non-object payload");
    }

    writeCachedFeed(data);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}
