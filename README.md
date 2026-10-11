# SOLSTICE — Journeys That Change You

A premium travel concept built around one idea: **plan around the light, not the landmarks.** The first viewport is a single long day. As you scroll, the sun rises over Cappadocia, crosses the Douro and Wadi Rum, lingers in a Lofoten golden hour and sets into a star-filled night over the Atacama. Every horizon on the site is drawn by code.

Production URL: `https://solstice-woad-eight.vercel.app`

> Fictional concept brand, built as a portfolio project. Prices, availability and itineraries are illustrative. Daylight figures are approximate.

---

## Concept

Most travel sites sell places as a grid of photos. SOLSTICE sells *time of day*. The hero is five cinematic chapters, each pinned to a moment of light:

| Chapter | Light | Place | What the landscape does |
|---|---|---|---|
| I | Dawn · 05:20 | Cappadocia, Türkiye | Balloons rise with the sun (scroll-linked) over fairy chimneys; cave windows glow |
| II | Morning · 08:40 | Douro Valley, Portugal | Mist over the river, hand-cut terraces, a quinta on the slope, vine rows |
| III | Noon · 12:30 | Wadi Rum, Jordan | Bleached sky, domed sandstone massifs with vertical fluting, a Bedouin camp |
| IV | Golden hour · 18:10 | Lofoten, Norway | Granite peaks mirrored in the sea, a sun glint column, red rorbuer on stilts |
| V | Dusk · 21:40 | Atacama, Chile | Salt-flat mirror, a volcano cone, flamingos, then the stars come out |

The rest of the page turns that feeling into tools: a filterable destination index, a daylight "chart of light", an itinerary builder, a sticky dial that explains how the studio paces a day, a year-at-a-glance matrix and an enquiry form.

## Brand & positioning

- **Name:** the solstice is the moment the sun reaches its extreme. The brand promises journeys timed to the best light of every place.
- **Promise:** slow, light-led travel. Arrive before sunrise, leave midday empty, stay for the last hour, let the night count.
- **Tone:** cinematic and exact. Short sentences, real places, specific hours. No superlatives, no fake reviews, awards or client logos.
- **Conversion:** "Begin with a conversation", a request for a first sketch that can attach the visitor's itinerary. It is a demo and nothing is sent.

## Audience

Curious, time-poor travellers (30–60) who have done the famous sights and now want fewer places, better hours and more meaning. They plan together, compare options and want to see the shape of a trip before they talk to anyone.

## Art direction

- **Palette:** ink `#1A1410`, amber `#E8A15A`, rose `#C9706A`, sand `#F2E6D8`. Supporting tones: sand-2 `#E9DAC6`, rose-deep `#9E4A45` and amber-deep `#8A5420` (text-safe accents on sand), muted `#B5A28C` (secondary text on ink).
- **Rhythm:** sections alternate like a day: ink (night) → sand (morning) → ink → sand-2 → ink → sand → dusk.
- **Landscapes:** layered SVG silhouettes generated from seeded value noise with type-specific profiles (fjord peaks, terraces, mesas, dunes, chimneys, karst towers, cliffs, salt flats). Each layer's colour is mixed between the current horizon colour and a scene "dark" by depth, which gives real aerial perspective that shifts with the time of day. Front layers carry a rim light in the sun's colour. A fine SVG grain sits over the stage.
- **Type over horizons:** the giant chapter names sit *between* the far mountains and the near hills, so the title rises from behind the land as each chapter begins.
- **Logo:** an original mark (a sun above the horizon and its reflection displaced below it, together reading as an S) with a stroke-built wordmark, so it renders identically without web fonts. `favicon.svg` is the mark on an ink tile.

## Typography

- **Italiana** (400) for display: chapter titles, headlines, numerals, clocks and prices.
- **Questrial** (400) for text, labels and controls; small caps labels are tracked at 0.18–0.24em.
- Loaded from Google Fonts with `display=swap`. Headlines use `text-wrap: balance` and `overflow-wrap: normal`; the chapter titles are sized by character count (`min(108vw / length, 19vh)`) so they never break or overflow.

## Motion language

- **The day scrub:** the sky gradient, sun arc, star field, horizon haze, layer colours, rim light, window lamps, water and sun glint are all functions of one value: the time of day. Chapters cross-fade with depth: incoming layers rise from below in parallax, outgoing near layers sink and dolly forward.
- **Light sweep reveals:** headings and ledes are revealed by a soft-edged mask that crosses them like the first rays over a valley (not the usual fade-up).
- **Index rules** draw left to right under destination rows on hover; rows flash amber when reached from a chapter card.
- **FLIP reordering:** itinerary days glide to their new places when moved, dragged or removed; new days unroll from the left.
- **The dial:** the sun hand sweeps around a 24-hour dial to each principle's hour.

## Signature interaction: how to use it

1. **Scroll** through the first section to travel from dawn to night. The clock, sun marker and chapter ticks along the bottom track your place in the day.
2. **Jump** to any chapter with the ticks (Dawn, Morning, Noon, Golden hour, Dusk). They are buttons, so keyboard users can tab to them.
3. **Add 3 days** on any chapter card to put that journey into your itinerary, or follow **The journey** to its row in the destination index.
4. **Filter** destinations by *When*, *Mood* and *Region*; the live count updates and an empty state explains when nothing matches.
5. **Chart of light:** switch between **21 June** and **21 December** to repaint the daylight bands; select any place (click, tap, or Tab + Enter) to see its daylight on both solstices. The amber route traces your itinerary in order, with numbered stops.
6. **Itinerary builder:** add a single day with the form, reorder by dragging the handle (mouse, pen or touch), by the arrow buttons, or by focusing the handle and pressing ↑/↓. Remove days with ×. The summary shows days, places, regions, total daylight on the chosen solstice and an illustrative estimate, plus a strip that paints each day in its own light. The draft persists in `sessionStorage` for the tab.
7. **The year:** pick a month to see which journeys are in season.
8. **Enquire:** validated inline (name, email, month, travellers, pace), with the option to attach your itinerary. On success it states clearly that this is a portfolio demo and nothing was sent or booked.

## Tech

- Static HTML, CSS and native ES modules; no build step and no third-party libraries.
- `landscape.js` (noise, profiles, scenes, sky model, thumbnails), `hero.js` (sticky stage controller), `itinerary.js` (state, builder, chart), `data.js` (content), `main.js` (boot and remaining sections).
- Daylight uses the standard sunrise equation for latitude and solar declination (±23.44°), which is approximate and ignores refraction and terrain.

## Local development

```bash
npx serve .
```

Then open the printed local URL. Modules need to be served over HTTP, not opened from the file system.

## Accessibility & performance

- Semantic landmarks, one `<h1>`, skip link, visible `:focus-visible` states on every control, and `aria-live` updates for the destination count, itinerary changes, chart selection and form results.
- Every pointer interaction has a keyboard equivalent: chapter buttons, focusable chart pins, arrow-key reordering on drag handles.
- Inactive chapter cards are `inert` and `aria-hidden`; decorative SVGs are hidden from assistive tech.
- `prefers-reduced-motion: reduce`: no parallax or dolly, no balloon bob or twinkle, no sweep masks or FLIP; chapters simply cross-fade as you scroll.
- The stage only renders on scroll while it is near the viewport (IntersectionObserver), there is no idle animation loop, and the rAF loop stops when the page is hidden.
- Text contrast meets WCAG AA; rose and amber are only used for text in their deep variants on light backgrounds.

## Known limitations

- The chart of light is a stylised equirectangular sketch with simplified coastlines; it is not a map for navigation.
- Daylight values are computed from latitude alone and are approximate.
- The itinerary only lives in the current browser tab (session storage), by design.
- Without JavaScript the hero shows a static horizon and the first chapter, and the destination list and tools are unavailable.

## Credit

Designed & built by Saad Bashir — https://www.linkedin.com/in/saadbashirmarketing/
