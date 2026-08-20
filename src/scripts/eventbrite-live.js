/**
 * Populates the events page from the live event schedule (see
 * ./events-feed.js, which owns the webhook and its cache). The webhook holds
 * the Eventbrite token in its own environment and returns only structured,
 * already-public event data — the browser never sees an API key.
 *
 * Rendering is cache-first: whatever was last cached — usually warmed by
 * events-prefetch.js while the visitor was on another page — is painted
 * immediately, then the live payload silently replaces it if it differs. Only
 * a visitor landing here first, with nothing cached, waits on the network, and
 * they wait behind loading skeletons rather than the empty state.
 *
 * There is no sample/dummy event data on this page — hand-written
 * placeholders would go stale or duplicate Eventbrite. So if the webhook is
 * unset, unreachable, or Eventbrite has nothing live, the page falls back to
 * the honest "no events right now, get in touch" state (see
 * UpcomingEvents.astro) rather than inventing anything.
 *
 * Expected response shape:
 * {
 *   "featured": { eyebrow, title, format, summary, date, date_label,
 *                 time_label, location, mode, topics: string[], image,
 *                 cta_text, cta_link } | null,
 *   "upcoming": {
 *     "filters": [{ id, label }, ...],
 *     "events": [{ title, category, format, summary, day, month, time_label,
 *                  location, mode, speaker, speaker_role, cta_text, cta_link,
 *                  seats_note }, ...]
 *   },
 *   "past": {
 *     "events": [{ title, format, date_label, location, summary, attendees,
 *                  link_text, link }, ...]
 *   }
 * }
 * Any field can be omitted or empty; missing sections just stay empty.
 * Two optional fields on `featured` degrade rather than break: `image` is the
 * event banner (Eventbrite's `logo.url`) and falls back to the format icon,
 * and `date` is the ISO 8601 start the "Add to Calendar" link is built from —
 * that button is left out entirely when the feed has no date.
 */

import { fetchFeed, readCachedFeed } from "./events-feed.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])
  );
}

const ICON_CALENDAR =
  '<svg class="featured-event-meta-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

const ICON_CLOCK_FEATURED =
  '<svg class="featured-event-meta-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>';

const ICON_PIN_FEATURED =
  '<svg class="featured-event-meta-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

const ICON_CLOCK =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline></svg>';

const ICON_PIN =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

const ICON_PERSON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

const ICON_ARROW =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

const ICON_CALENDAR_ADD =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="18" y1="15" x2="18" y2="21"/><line x1="15" y1="18" x2="21" y2="18"/></svg>';

/**
 * Button.astro's styles are scoped by Astro to an auto-generated
 * `data-astro-cid-*` attribute. Buttons built here are plain HTML, so they
 * borrow that attribute off an existing statically-rendered button (the empty
 * state always ships one) rather than hardcoding a hash that changes whenever
 * the component does. Without it the injected buttons render unstyled.
 */
function buttonAttrs(...modifiers) {
  const sample = document.querySelector(".ui-button");
  const scopeAttr = sample
    ? [...sample.attributes]
        .map((attribute) => attribute.name)
        .filter((name) => name.startsWith("data-astro-cid-"))
        .join(" ")
    : "";
  const classes = ["ui-button", ...modifiers].join(" ");
  return `class="${classes}" ${scopeAttr}`.trim();
}

function renderFilterButton(filter, index) {
  return `<button type="button" class="event-filter-btn${index === 0 ? " active" : ""}" data-event-filter="${escapeHtml(filter.id)}" aria-pressed="${index === 0 ? "true" : "false"}">${escapeHtml(filter.label)}</button>`;
}

function renderEventCard(event) {
  const summaryHtml = event.summary
    ? `<p class="event-card-summary">${escapeHtml(event.summary)}</p>`
    : "";
  const speakerLine = event.speaker_role
    ? `${event.speaker} — ${event.speaker_role}`
    : event.speaker;
  const seatsHtml = event.seats_note
    ? `<span class="event-seats-note">${escapeHtml(event.seats_note)}</span>`
    : "";

  return `<article class="event-card" data-event-category="${escapeHtml(event.category)}">
    <div class="event-card-top">
      <div class="event-date-block" aria-hidden="true">
        <span class="event-date-day">${escapeHtml(event.day)}</span>
        <span class="event-date-month">${escapeHtml(event.month)}</span>
      </div>
      <div class="event-tags">
        <span class="event-tag event-tag--format">${escapeHtml(event.format)}</span>
        <span class="event-tag event-tag--mode">${escapeHtml(event.mode)}</span>
      </div>
    </div>
    <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
    ${summaryHtml}
    <ul class="event-card-meta">
      <li>${ICON_CLOCK}${escapeHtml(event.time_label)}</li>
      <li>${ICON_PIN}${escapeHtml(event.location)}</li>
      <li>${ICON_PERSON}${escapeHtml(speakerLine)}</li>
    </ul>
    <div class="event-card-footer">
      ${seatsHtml}
      <a class="event-card-link" href="${escapeHtml(event.cta_link)}">
        ${escapeHtml(event.cta_text)}
        ${ICON_ARROW}
        <span class="visually-hidden">: ${escapeHtml(event.title)}</span>
      </a>
    </div>
  </article>`;
}

const FORMAT_ICONS = {
  webinar: "/assets/icons/events/webinar.svg",
  workshop: "/assets/icons/events/workshop.svg",
  roundtable: "/assets/icons/events/roundtable.svg",
  conference: "/assets/icons/events/conference.svg",
};

const DEFAULT_EVENT_MINUTES = 60;

/**
 * The featured card shows the event's own banner when the feed carries one.
 * Eventbrite images are not always set, so the fallback is the icon for the
 * format on the card's own gradient — a stock photo would say nothing about
 * the session and read as filler.
 */
function renderFeaturedMedia(event) {
  const image = event.image || event.image_url || event.logo_url;

  if (image) {
    return `<div class="featured-event-media">
      <img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async" />
    </div>`;
  }

  const format = String(event.format ?? "").toLowerCase();
  const icon =
    FORMAT_ICONS[Object.keys(FORMAT_ICONS).find((name) => format.includes(name))] ??
    FORMAT_ICONS.webinar;

  return `<div class="featured-event-media featured-event-media--placeholder">
      <img src="${icon}" alt="" width="56" height="56" loading="lazy" />
    </div>`;
}

function toCalendarStamp(date) {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/**
 * Only the start is machine-readable in the feed, so the length of the session
 * comes from the two clock times in `time_label` ("14:00 – 15:00 BST") and
 * falls back to an hour when the label has no range to read.
 */
function eventMinutes(timeLabel) {
  const times = String(timeLabel ?? "").match(/\d{1,2}:\d{2}/g);
  if (!times || times.length < 2) return DEFAULT_EVENT_MINUTES;

  const [start, end] = times.slice(0, 2).map((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  });

  const span = end - start;
  if (span > 0) return span;
  // A backwards span is a session that runs past midnight.
  if (span < 0) return span + 24 * 60;
  return DEFAULT_EVENT_MINUTES;
}

/**
 * A Google Calendar "create event" URL with the session already filled in, so
 * the button is a plain link that opens the pre-filled form in a new tab.
 * Returns null when the feed has no readable start, and the caller then leaves
 * the button out.
 */
function googleCalendarLink(event) {
  const start = new Date(event.date);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + eventMinutes(event.time_label) * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title ?? "",
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    details: [event.summary, event.cta_link].filter(Boolean).join("\n\n"),
    location: event.location ?? "",
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

function renderFeatured(event) {
  const topics = Array.isArray(event.topics) && event.topics.length
    ? event.topics
    : ["Live session", "Q&A"];

  const calendarLink = googleCalendarLink(event);
  const calendarButton = calendarLink
    ? `<a ${buttonAttrs("ui-button--outline", "ui-button--md")} href="${escapeHtml(calendarLink)}" target="_blank" rel="noopener noreferrer">${ICON_CALENDAR_ADD}Add to Calendar</a>`
    : "";

  return `<section class="events-section events-section--tight">
    <div class="container">
      <article class="featured-event">
        <div class="featured-event-body">
          <p class="featured-event-eyebrow">
            <span class="featured-event-pulse" aria-hidden="true"></span>
            ${escapeHtml(event.eyebrow)}
          </p>
          <div class="event-tags mb-3">
            <span class="event-tag event-tag--format">${escapeHtml(event.format)}</span>
            <span class="event-tag event-tag--mode">${escapeHtml(event.mode)}</span>
          </div>
          <h2 class="featured-event-title">${escapeHtml(event.title)}</h2>
          ${event.summary ? `<p class="featured-event-summary">${escapeHtml(event.summary)}</p>` : ""}
          <ul class="featured-event-topics">
            ${topics.map((topic) => `<li class="featured-event-topic">${escapeHtml(topic)}</li>`).join("")}
          </ul>
        </div>
        <div class="featured-event-aside">
          ${renderFeaturedMedia(event)}
          <ul class="featured-event-meta">
            <li class="featured-event-meta-item">
              ${ICON_CALENDAR}
              <span><span class="featured-event-meta-label">Date</span><span class="featured-event-meta-value">${escapeHtml(event.date_label)}</span></span>
            </li>
            <li class="featured-event-meta-item">
              ${ICON_CLOCK_FEATURED}
              <span><span class="featured-event-meta-label">Time</span><span class="featured-event-meta-value">${escapeHtml(event.time_label)}</span></span>
            </li>
            <li class="featured-event-meta-item">
              ${ICON_PIN_FEATURED}
              <span><span class="featured-event-meta-label">Where</span><span class="featured-event-meta-value">${escapeHtml(event.location)}</span></span>
            </li>
          </ul>
          <div class="featured-event-actions">
            <a ${buttonAttrs("ui-button--primary", "ui-button--md")} href="${escapeHtml(event.cta_link)}">${escapeHtml(event.cta_text)}</a>
            ${calendarButton}
          </div>
        </div>
      </article>
    </div>
  </section>`;
}

function renderPastEvent(event) {
  return `<article class="past-event-row">
    <div class="past-event-when">
      <span class="past-event-date">${escapeHtml(event.date_label)}</span>
      <span class="past-event-place">${escapeHtml(event.location)} · ${escapeHtml(event.attendees)}</span>
    </div>
    <div>
      <div class="event-tags mb-2">
        <span class="event-tag event-tag--format">${escapeHtml(event.format)}</span>
      </div>
      <h3 class="past-event-title">${escapeHtml(event.title)}</h3>
      <p class="past-event-summary">${escapeHtml(event.summary)}</p>
    </div>
    <a class="event-card-link" href="${escapeHtml(event.link)}">
      ${escapeHtml(event.link_text)}
      ${ICON_ARROW}
      <span class="visually-hidden">: ${escapeHtml(event.title)}</span>
    </a>
  </article>`;
}

function applyFeatured(featured) {
  const root = document.getElementById("featured-event-root");
  if (!root) return;
  root.innerHTML = featured ? renderFeatured(featured) : "";
}

function applyUpcoming(upcoming) {
  const filtersRoot = document.getElementById("event-filters-root");
  const grid = document.getElementById("events-grid");
  if (!filtersRoot || !grid) return;

  const events = Array.isArray(upcoming?.events) ? upcoming.events : [];
  const filters =
    Array.isArray(upcoming?.filters) && upcoming.filters.length
      ? upcoming.filters
      : [{ id: "all", label: "All events" }];

  filtersRoot.innerHTML = filters.map(renderFilterButton).join("");
  filtersRoot.hidden = !(filters.length > 1 && events.length > 0);

  grid.innerHTML = events.map(renderEventCard).join("");

  document
    .getElementById("events-empty")
    ?.classList.toggle("is-visible", events.length === 0);
}

function applyPast(events) {
  const root = document.getElementById("past-events-root");
  if (!root) return;

  // No static past-events section exists to inject into (see events.astro) —
  // this builds the whole section, or leaves the mount point empty if there's
  // nothing to show. The heading copy lives in content/events/events.md and
  // is threaded through as data attributes so it isn't duplicated here.
  if (!Array.isArray(events) || events.length === 0) {
    root.innerHTML = "";
    return;
  }

  root.innerHTML = `<section class="events-section" id="past-events">
    <div class="container">
      <div class="events-section-head">
        <span class="events-badge">${escapeHtml(root.dataset.badge)}</span>
        <h2 class="events-section-title">${escapeHtml(root.dataset.title)}</h2>
        <p class="events-section-subtitle">${escapeHtml(root.dataset.subtitle)}</p>
      </div>
      <div class="past-events-list">
        ${events.map(renderPastEvent).join("")}
      </div>
    </div>
  </section>`;
}

function setStatus(message) {
  const status = document.getElementById("events-status");
  if (status) status.textContent = message;
}

/**
 * What the cached payload was rendered from, so a revalidation that comes back
 * unchanged — the common case — leaves the DOM alone instead of rebuilding the
 * cards under the visitor and resetting whichever filter they picked.
 */
let renderedSignature = null;

function applyFeed(data) {
  const signature = JSON.stringify(data);
  if (signature === renderedSignature) return;

  applyFeatured(data.featured ?? null);
  applyUpcoming(data.upcoming);
  applyPast(data.past?.events);

  renderedSignature = signature;
  setStatus("");
}

/**
 * Nothing to show and nothing cached: clear the skeletons out of the mount
 * points and let the "no events right now" state stand.
 */
function showEmptyState() {
  document.getElementById("featured-event-root")?.replaceChildren();
  document.getElementById("events-grid")?.replaceChildren();
  document.getElementById("events-empty")?.classList.add("is-visible");
  setStatus("");
}

async function hydrateLiveEvents() {
  // Painted first and without waiting on the network — usually warmed by
  // events-prefetch.js while the visitor was on another page.
  const cached = readCachedFeed();
  if (cached) {
    try {
      applyFeed(cached);
    } catch (error) {
      console.warn("[events] cached schedule was malformed, waiting for the live one", error);
    }
  }

  let data = null;
  try {
    data = await fetchFeed();
  } catch (error) {
    console.warn("[events] live schedule fetch failed", error);
  }

  if (!data) {
    // Stale cards beat an empty page, so a failed refresh only clears the
    // screen when there was nothing on it to begin with.
    if (renderedSignature === null) showEmptyState();
    return;
  }

  try {
    applyFeed(data);
  } catch (error) {
    console.warn("[events] live schedule payload was malformed", error);
    if (renderedSignature === null) showEmptyState();
  }
}

hydrateLiveEvents();
