import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { ChartTheme } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SlideDefinition =
  | { type: 'title';   heading: string; subheading?: string; notes?: string }
  | { type: 'bullets'; heading: string; bullets: string[];   notes?: string }
  | { type: 'chart';   heading: string; chartPath: string;   caption?: string; notes?: string }
  | { type: 'content'; heading: string; body: string;        notes?: string };

export interface DeckInput {
  title: string;
  subtitle?: string;
  outputName?: string;
  slides: SlideDefinition[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function notesHtml(notes: string | undefined): string {
  if (!notes) return '';
  return `\n        <aside class="notes">${escapeHtml(notes)}</aside>`;
}

// ─── Slide renderers ──────────────────────────────────────────────────────────

function renderTitleSlide(slide: Extract<SlideDefinition, { type: 'title' }>): string {
  const sub = slide.subheading
    ? `\n        <p class="subtitle">${escapeHtml(slide.subheading)}</p>`
    : '';
  return `      <section class="slide-title">
        <h1>${escapeHtml(slide.heading)}</h1>${sub}${notesHtml(slide.notes)}
      </section>`;
}

function renderBulletsSlide(slide: Extract<SlideDefinition, { type: 'bullets' }>): string {
  const items = slide.bullets.map((b) => {
    // Nested bullet: lines starting with two spaces + dash
    const nested = b.startsWith('  -');
    const text = nested ? b.slice(3).trimStart() : b;
    const tag = nested ? 'li class="nested"' : 'li';
    return `          <${tag}>${escapeHtml(text)}</li>`;
  });
  return `      <section class="slide-bullets">
        <h2>${escapeHtml(slide.heading)}</h2>
        <ul>
${items.join('\n')}
        </ul>${notesHtml(slide.notes)}
      </section>`;
}

function renderChartSlide(
  slide: Extract<SlideDefinition, { type: 'chart' }>,
  inlineSvg: string,
): string {
  const caption = slide.caption
    ? `\n        <p class="caption">${escapeHtml(slide.caption)}</p>`
    : '';
  return `      <section class="slide-chart">
        <h2>${escapeHtml(slide.heading)}</h2>
        <div class="chart-wrap">${inlineSvg}</div>${caption}${notesHtml(slide.notes)}
      </section>`;
}

function renderContentSlide(slide: Extract<SlideDefinition, { type: 'content' }>): string {
  // body is treated as raw HTML for rich content
  return `      <section class="slide-content">
        <h2>${escapeHtml(slide.heading)}</h2>
        <div class="body">${slide.body}</div>${notesHtml(slide.notes)}
      </section>`;
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildDeckHtml(input: DeckInput, theme: ChartTheme): string {
  const sectionsHtml: string[] = [];

  for (const slide of input.slides) {
    switch (slide.type) {
      case 'title':
        sectionsHtml.push(renderTitleSlide(slide));
        break;
      case 'bullets':
        sectionsHtml.push(renderBulletsSlide(slide));
        break;
      case 'chart': {
        const resolved = path.resolve(slide.chartPath);
        let svg: string;
        try {
          svg = fsSync.readFileSync(resolved, 'utf8');
        } catch {
          svg = `<p class="chart-error">Chart not found: ${escapeHtml(slide.chartPath)}</p>`;
        }
        sectionsHtml.push(renderChartSlide(slide, svg));
        break;
      }
      case 'content':
        sectionsHtml.push(renderContentSlide(slide));
        break;
    }
  }

  const accent = theme.palette[0] ?? '#4f8ef7';
  const accent2 = theme.palette[1] ?? theme.palette[0] ?? '#7ecfd4';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(input.title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/theme/black.css">
  <style>
    :root {
      --r-background-color: ${theme.background};
      --r-main-color: ${theme.textColor};
      --r-main-font: ${theme.fontFamily}, system-ui, sans-serif;
      --r-heading-font: ${theme.fontFamily}, system-ui, sans-serif;
      --r-heading-color: ${theme.textColor};
      --r-link-color: ${accent};
      --r-accent: ${accent};
      --r-accent2: ${accent2};
    }
    .reveal { font-family: var(--r-main-font); }
    .reveal h1, .reveal h2 { color: var(--r-heading-color); }
    .reveal h1 { font-size: 2.2em; font-weight: ${theme.fontWeight.title}; }
    .reveal h2 { font-size: 1.4em; font-weight: ${theme.fontWeight.subtitle}; border-bottom: 2px solid var(--r-accent); padding-bottom: 0.2em; margin-bottom: 0.6em; }
    .reveal .subtitle { color: var(--r-accent2); font-size: 1.1em; margin-top: 0.4em; }
    .reveal ul { list-style: none; padding: 0; margin: 0; }
    .reveal ul li { padding: 0.35em 0 0.35em 1.4em; position: relative; font-size: 0.9em; }
    .reveal ul li::before { content: '▸'; position: absolute; left: 0; color: var(--r-accent); }
    .reveal ul li.nested { padding-left: 2.6em; font-size: 0.8em; opacity: 0.85; }
    .reveal ul li.nested::before { left: 1.2em; content: '–'; }
    .reveal .chart-wrap { display: flex; justify-content: center; align-items: center; max-height: 55vh; overflow: hidden; }
    .reveal .chart-wrap svg { max-width: 100%; max-height: 55vh; height: auto; }
    .reveal .caption { font-size: 0.65em; opacity: 0.7; margin-top: 0.4em; font-style: italic; }
    .reveal .chart-error { color: #e05; font-size: 0.8em; }
    .reveal .body { font-size: 0.85em; line-height: 1.6; text-align: left; }
    .reveal section { padding: 1.5em; }
    .slide-title { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
    .slide-title h1 { border-left: 5px solid var(--r-accent); padding-left: 0.5em; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
${sectionsHtml.join('\n')}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4/plugin/notes/notes.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      transition: 'slide',
      plugins: [RevealNotes],
    });
  </script>
</body>
</html>`;
}

// ─── Write deck file ──────────────────────────────────────────────────────────

export async function writeDeckFile(
  html: string,
  input: DeckInput,
  theme: ChartTheme,
): Promise<string> {
  const stem = input.outputName ?? `${slugify(input.title)}-${Date.now()}`;
  const outDir = path.resolve(process.cwd(), theme.outputDir);
  await fs.mkdir(outDir, { recursive: true });
  const deckPath = path.join(outDir, `${stem}-deck.html`);
  await fs.writeFile(deckPath, html, 'utf8');
  return deckPath;
}
