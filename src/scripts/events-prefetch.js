/**
 * Warms the event-schedule cache from every page of the site, so that by the
 * time a visitor reaches /events the schedule is already in localStorage and
 * the page can paint it instead of a loading state.
 *
 * It runs only when the browser is idle and only when there is nothing usable
 * cached, so the visitor's actual page never waits on it and repeat views cost
 * no requests at all. The events page revalidates for itself, so this skips
 * that page entirely rather than racing it for the same payload.
 */

import { fetchFeed, readCachedFeed } from "./events-feed.js";

const IDLE_TIMEOUT_MS = 4000;

function warmEventsCache() {
  if (document.getElementById("featured-event-root")) return;
  if (readCachedFeed()) return;

  // A failed warm-up is invisible by design: /events does its own fetch and
  // falls back to the "no events right now" state on its own.
  fetchFeed().catch(() => {});
}

const scheduleWarmUp =
  window.requestIdleCallback ?? ((callback) => setTimeout(callback, IDLE_TIMEOUT_MS));

scheduleWarmUp(warmEventsCache, { timeout: IDLE_TIMEOUT_MS });
