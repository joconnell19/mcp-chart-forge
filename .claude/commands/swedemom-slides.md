# Swedemom Slide Deck Generator

You are building a Reveal.js HTML slide deck for Swedemom. Follow these brand standards and design patterns exactly. The output must be a single self-contained HTML file that renders correctly when opened in a browser.

---

## Brand Identity

**Company:** Swedemom (eBay reseller since 1999, 544k+ items sold)
**Sub-brand:** SCOG — Swedemom Center of Giving (501(c)(3) nonprofit arm)
**Tagline:** *Changing the world by redeeming people, places, & things!*

**When to use which brand:**
- **Swedemom** (default): purple butterfly, blue-grey + purple palette. Use for most decks.
- **SCOG**: green butterfly with purple heart, adds green to the palette. Use only when the deck is specifically about the nonprofit/SCOG mission.

---

## Typography

**Font:** Outfit (Google Fonts) — weights 300, 400, 500, 600, 700
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Heading sizes:** Slide titles ~2.4em weight 600. Subtitles ~1em weight 400.
**Body:** 0.95em weight 400. Labels/captions: 0.75em weight 500 uppercase letter-spacing 0.06em.
**Big numbers (stats):** 2.5em+ weight 600.

---

## Colour Palette

### Swedemom (default)
```css
--sm-blue-grey: #5E7F8E;     /* wordmark colour, headings */
--sm-purple: #8B6BAE;         /* butterfly, accent, chart primary, financial figures */
--sm-purple-light: #B89FCC;   /* lighter purple for gradients, secondary data */
--sm-purple-soft: rgba(139, 107, 174, 0.08);  /* card tints */
--sm-lavender: #D4C5E2;       /* progress bars, subtle fills */
--sm-dark: #1a1a1a;           /* dark slide backgrounds */
--sm-white: #FFFFFF;           /* light slide backgrounds */
--sm-text: #2d2d2d;           /* body text on light */
--sm-text-light: #f5f5f7;     /* body text on dark */
--sm-text-muted: #86868b;     /* secondary text */
--sm-green-badge: #5B8C3E;    /* positive growth indicators only */
```

### SCOG (when specifically about the nonprofit)
All of the above, plus:
```css
--scog-green: #5B8C3E;        /* headings, accents, rules */
--scog-green-light: #7BAF5C;  /* lighter green for gradients */
```
For SCOG decks, headings use `--scog-green` instead of `--sm-blue-grey`.

### Gradient backgrounds
Used for hero/feature slides:
```css
background: linear-gradient(135deg, #C8DAE4 0%, #D4C5E2 50%, #E8D5F0 100%);
```
This is a soft blue → lavender → light purple gradient.

---

## Logo Assets

Logos are stored in the repo as PNG files. Reference them via **relative paths** from the deck location -- do NOT base64-encode.

- **Swedemom logo:** `assets/swedemom/logo.png`
- **Swedemom butterfly:** `assets/swedemom/butterfly.png`
- **SCOG logo:** `assets/scog/logo.png`
- **SCOG butterfly:** `assets/scog/butterfly.png`

Decks live at `decks/{brand}/YYYY-MM-DD-topic/deck.html`, so the relative path to assets is `../../../assets/{brand}/`:
```html
<img src="../../../assets/swedemom/logo.png" alt="Swedemom" style="height: 80px;">
```

**Footer on every slide:** Small butterfly icon (24px height) + deck label text, positioned bottom-left. Thin coloured rule across the bottom of the slide (purple for Swedemom, green for SCOG).

**Footer / controls overlap prevention:** The global footer is `position: absolute` so it sits outside the slide flow. To prevent overlap:
- Set `.reveal .controls { bottom: 54px; }` so Reveal's nav arrows sit above the footer
- Set slide bottom padding to at least `90px` (`.reveal .slides section { padding: 40px 80px 90px; }`) so content clears the footer

---

## Slide Types & Layout Patterns

### 1. Title Slide
- White background
- Logo centered, large
- Tagline below in italic, accent colour
- Thin accent rule at bottom

### 2. Content + Image (two-column)
- Text on one side (~55%), image on other (~45%)
- Image has rounded corners (1rem), subtle shadow
- Can be on white OR dark background
- Heading is large, accent-coloured

### 3. Dark Content Slide
- `#1a1a1a` background, light text
- Good for "problem" slides, chart slides, emphasis
- Heading in accent colour (purple or green)

### 4. Gradient Hero Slide
- Blue→lavender→purple gradient background
- Used for feature showcases, solutions, key messages
- Cards/elements use glassmorphism: `backdrop-filter: blur(20px)`, `rgba(255,255,255,0.12)` background, `rgba(255,255,255,0.2)` border

### 5. Stats / KPI Cards
- Gradient background
- Row of 3-4 glass cards, each containing:
  - Big number (2.5em, `--sm-purple` or `--sm-blue-grey`)
  - Label (small, uppercase)
  - Optional growth badge: green pill with `▲ XX%`
- Footer summary line in italic

### 6. Process / Flow
- Gradient background
- Horizontal row of steps with circle icons
- Connected by thin arrows or lines
- Each step: icon circle → label → description

### 7. Architecture / Diagram
- White background
- Dark rounded cards (`#2d2d2d`, border-radius 1rem) for shared/platform elements
- Green or purple bordered cards for instances/variants
- Dashed lines for separation

### 8. Financial / Comparison
- White or light background
- Side-by-side rounded cards
- Big dollar amounts in `--sm-purple`
- Labels in small uppercase
- Optional connecting arrow between cards

### 9. Chart Slide
- Dark background (`#1a1a1a`) for the chart area
- Chart.js with purple bars/lines (`--sm-purple` primary, `--sm-purple-light` secondary)
- Grid: `rgba(255,255,255,0.08)`
- Axis text: Outfit 11px, `#86868b`
- Caption below chart in italic

### 10. Timeline / Roadmap
- White background
- Horizontal progress bar with gradient fill (accent colour fading to grey for future)
- Phase labels below at each segment

### 11. Closing Slide
- White background
- "Let's Talk" or "Thank You" heading
- Optional photo, centered
- Tagline repeated
- Contact info if relevant

---

## Reveal.js Configuration

```javascript
Reveal.initialize({
  hash: true,
  transition: 'fade',
  transitionSpeed: 'default',
  width: 1920,
  height: 1080,
  margin: 0,
  plugins: [RevealNotes],
});
```

- Always include Notes plugin (`S` key for speaker view)
- Speaker notes in `<aside class="notes">` on every slide
- Include Chart.js 4.4.1 CDN if any chart slides are present

---

## Output Rules

1. **Always output a complete, runnable HTML file** — no placeholders, no TODOs.
2. Reference logo PNGs via relative paths to `assets/` -- never base64-encode.
3. Every slide gets speaker notes (even if brief).
4. Footer with butterfly + deck label on every slide.
5. Alternate light/dark/gradient backgrounds for visual rhythm.
6. After writing the HTML file, use Playwright MCP to screenshot key slides and verify quality.
7. Save decks to `decks/swedemom/YYYY-MM-DD-topic/deck.html` (or `decks/scog/...` for SCOG decks).
