/**
 * Fetches the live event schedule from a public n8n webhook and populates the
 * events page after load. The webhook holds the Eventbrite token in its own
 * environment and returns only structured, already-public event data — the
 * browser never sees an API key.
 *
 * There is no sample/dummy event data on this page — hand-written
 * placeholders would go stale or duplicate Eventbrite. The page's initial
 * HTML already shows the "no events right now, get in touch" empty state
 * (see UpcomingEvents.astro), so if the webhook is unset, unreachable, or
 * Eventbrite has nothing live, that honest empty state is simply what stays
 * on screen — nothing here is required for the page to be correct.
 *
 * Expected response shape:
 * {
 *   "featured": { eyebrow, title, format, summary, date_label, time_label,
 *                 location, mode, topics: string[], cta_text, cta_link } | null,
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
 */

const WEBHOOK_URL = import.meta.env.PUBLIC_EVENTBRITE_WEBHOOK_URL;
const FETCH_TIMEOUT_MS = 8000;

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

/**
 * Button.astro's styles are scoped by Astro to an auto-generated `astro-*`
 * class. Buttons built here are plain HTML, so they borrow that class off an
 * existing statically-rendered button rather than hardcoding a hash that can
 * change on every build.
 */
function buttonClass(...modifiers) {
  const sample = document.querySelector(".ui-button");
  const scopeClass = sample
    ? [...sample.classList].filter((c) => c.startsWith("astro-")).join(" ")
    : "";
  return ["ui-button", ...modifiers, scopeClass].filter(Boolean).join(" ");
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

function renderFeatured(event) {
  const topics = Array.isArray(event.topics) && event.topics.length
    ? event.topics
    : ["Live session", "Q&A"];

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
          <a class="${buttonClass("ui-button--primary", "ui-button--lg")}" href="${escapeHtml(event.cta_link)}">${escapeHtml(event.cta_text)}</a>
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

async function hydrateLiveEvents() {
  if (!WEBHOOK_URL) return;

  let data;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(WEBHOOK_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`webhook responded ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.warn("[events] live schedule fetch failed, showing the no-events state", error);
    return;
  }

  if (!data || typeof data !== "object") return;

  try {
    applyFeatured(data.featured ?? null);
    applyUpcoming(data.upcoming);
    applyPast(data.past?.events);
  } catch (error) {
    console.warn("[events] live schedule payload was malformed, showing the no-events state", error);
  }
}

hydrateLiveEvents();
