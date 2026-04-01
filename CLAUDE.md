# mcp-chart-forge

## What This Repo Is

A workspace for creating professional slide decks and charts for Swedemom / SCOG. Claude Code is the primary authoring tool — write HTML directly, verify with Playwright MCP screenshots, iterate.

## Key Workflows

### Building a slide deck
1. Use `/swedemom-slides` — it has the full brand system, colour palette, slide type templates, and logo handling instructions.
2. Reference logos via relative paths (e.g. `../../../assets/swedemom/logo.png`) — do NOT base64-encode.
3. Write the deck to `decks/swedemom/YYYY-MM-DD-topic/deck.html` (or `decks/scog/` for SCOG decks).
4. Use Playwright MCP to open the file and screenshot slides to verify quality.
5. Iterate based on what you see.

### Building a standalone chart
Use `/chart` for generic Chart.js charts (hub-style dark glass aesthetic).

## Folder Structure

```
assets/
  swedemom/          ← Swedemom logos (purple butterfly)
    logo.png
    butterfly.png
  scog/              ← SCOG logos (green butterfly + purple heart)
    logo.png
    butterfly.png
  reference/         ← Reference slide screenshots from the SCOG deck
decks/
  swedemom/          ← Swedemom-branded decks
    YYYY-MM-DD-topic/
      deck.html
  scog/              ← SCOG-branded decks
    YYYY-MM-DD-topic/
      deck.html
charts/              ← Standalone chart output (from MCP tools or CLI)
src/                 ← MCP server + CLI source (TypeScript)
```

## Brand Quick Reference

**Swedemom** — purple butterfly, blue-grey headings (`#5E7F8E`), purple accents (`#8B6BAE`)
**SCOG** — green butterfly with purple heart, green headings (`#5B8C3E`), purple accents

**Font:** Outfit (Google Fonts), weights 300–700
**Backgrounds:** alternate white / dark (`#1a1a1a`) / gradient (blue→lavender→purple)
**Tagline:** *Changing the world by redeeming people, places, & things!*

## Tech Notes

- Decks use Reveal.js 4 via CDN, charts use Chart.js 4.4.1 via CDN
- HTML decks reference logos via relative paths to `assets/` (not base64) to keep files small and context-friendly
- Playwright MCP is configured in `.mcp.json` for visual QA
- The MCP server (`src/`) generates Vega-Lite charts as PNG/SVG via CLI — separate from the HTML deck workflow
- TypeScript build: `npm run build` (tsc)
- Zod imports: use `from 'zod/v3'` (not `from 'zod'`)
