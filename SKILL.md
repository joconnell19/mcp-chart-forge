---
name: chart-slide-generator
description: Generate polished, on-brand HTML charts and Reveal.js slide decks matching the hub design system. Use whenever asked to create charts, graphs, visualisations, or presentation slides.
---

You are an expert data visualisation and presentation designer. When asked to create charts or slide decks, always produce **self-contained HTML** using the standards below. The HTML must render correctly when opened directly in a browser or displayed as an inline artifact.

---

## Brand Standards

**Font:** Outfit (Google Fonts) — weights 300, 400, 500, 600, 700
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
Fallback: `-apple-system, BlinkMacSystemFont, sans-serif`

**Colour palette (use in this order):**
- `#00d4aa` — Teal (primary accent)
- `#0a84ff` — Blue (secondary)
- `#bf5af2` — Purple (tertiary)
- `#ff9f0a` — Orange (quaternary)
- `#ff453a` — Red (quinary)

**Theme:** Dark by default. Always implement both dark and light modes via `data-bs-theme` or a `[data-theme]` toggle.

**Dark mode tokens:**
```css
--bg-page:        #0f0f11;
--bg-card:        rgba(255, 255, 255, 0.02);
--border-card:    rgba(255, 255, 255, 0.06);
--bg-hover:       rgba(255, 255, 255, 0.04);
--text-primary:   #f5f5f7;
--text-secondary: #86868b;
--text-tertiary:  #6e6e73;
--grid-color:     rgba(255, 255, 255, 0.05);
```

**Light mode overrides:**
```css
--bg-page:        #f5f5f7;
--bg-card:        rgba(0, 0, 0, 0.02);
--border-card:    rgba(0, 0, 0, 0.06);
--bg-hover:       rgba(0, 0, 0, 0.04);
--text-primary:   #1d1d1f;
--text-secondary: #6e6e73;
--text-tertiary:  #86868b;
--grid-color:     rgba(0, 0, 0, 0.05);
```

**Accent tokens (per-page):**
```css
--accent:      #00d4aa;
--accent-soft: rgba(0, 212, 170, 0.08);
--accent-glow: rgba(0, 212, 170, 0.15);
```

**Border radius system:**
```css
--radius-sm: 0.75rem;   /* 12px */
--radius-md: 1rem;      /* 16px */
--radius-lg: 1.25rem;   /* 20px */
--radius-xl: 1.5rem;    /* 24px */
```

---

## Charts

**Library:** Chart.js 4.4.1
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```

**Always:**
- Title: 1rem, weight 600, letter-spacing -0.01em, `var(--text-primary)`
- Subtitle: 0.8rem, weight 400, `var(--text-secondary)`
- `responsive: true, maintainAspectRatio: false`
- Grid lines: `var(--grid-color)`, axis borders hidden (`border: { display: false }`)
- Axis tick font: Outfit 11px
- Tooltip: custom glass tooltip (see template below)
- Legend: hidden by default; only show for 2+ series, custom HTML legend outside the canvas
- Rounded bar corners: `borderRadius: 4`
- Smooth lines: `tension: 0.4`, `fill: true` with `rgba(0,212,170,0.08)` for area charts
- Card: glassmorphism — `backdrop-filter: blur(20px)`, `var(--bg-card)` background, `var(--border-card)` border, `var(--radius-lg)` radius
- Card entrance animation: slide up + fade in, 0.6s `cubic-bezier(0.16, 1, 0.3, 1)`

**Chart type guide:**
- Comparing categories → Bar (vertical default, horizontal if labels are long, bar thickness 24px)
- Trend over time → Line with area fill
- Part-of-whole (≤6 segments) → Doughnut, 70% cutout
- Correlation → Scatter

**Single chart HTML template:**
```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  :root {
    --accent: #00d4aa; --accent-soft: rgba(0,212,170,0.08); --accent-glow: rgba(0,212,170,0.15);
    --radius-lg: 1.25rem;
  }
  [data-theme="dark"] {
    --bg-page: #0f0f11; --bg-card: rgba(255,255,255,0.02); --border-card: rgba(255,255,255,0.06);
    --text-primary: #f5f5f7; --text-secondary: #86868b; --grid-color: rgba(255,255,255,0.05);
  }
  [data-theme="light"] {
    --bg-page: #f5f5f7; --bg-card: rgba(0,0,0,0.02); --border-card: rgba(0,0,0,0.06);
    --text-primary: #1d1d1f; --text-secondary: #6e6e73; --grid-color: rgba(0,0,0,0.05);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', -apple-system, sans-serif; background: var(--bg-page); color: var(--text-primary); padding: 24px; min-height: 100vh; transition: background 0.3s, color 0.3s; }
  .card { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-lg); padding: 1.5rem; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); animation: cardReveal 0.6s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes cardReveal { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  .chart-title { font-size: 1rem; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 0.25rem; }
  .chart-subtitle { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.25rem; }
  .chart-container { position: relative; height: 280px; }
  .theme-toggle { position: fixed; top: 16px; right: 16px; background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 50px; padding: 6px 14px; font-family: 'Outfit', sans-serif; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer; backdrop-filter: blur(20px); }
  /* Glass tooltip */
  .glass-tooltip { background: var(--bg-page); border: 1px solid var(--border-card); border-radius: 0.75rem; padding: 10px 14px; font-family: 'Outfit', sans-serif; font-size: 0.8rem; pointer-events: none; position: absolute; transition: opacity 0.15s; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .glass-tooltip .tooltip-label { color: var(--text-secondary); margin-bottom: 4px; }
  .glass-tooltip .tooltip-value { color: var(--text-primary); font-weight: 600; }
</style>
</head>
<body>
  <button class="theme-toggle" onclick="toggleTheme()">Toggle theme</button>
  <div class="card">
    <div class="chart-title">{title}</div>
    <div class="chart-subtitle">{subtitle}</div>
    <div class="chart-container"><canvas id="chart"></canvas></div>
    <div id="tooltip" class="glass-tooltip" style="opacity:0"></div>
  </div>
  <script>
    const COLORS = ['#00d4aa','#0a84ff','#bf5af2','#ff9f0a','#ff453a'];
    function toggleTheme() {
      document.documentElement.dataset.theme =
        document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      if (window.chart) window.chart.update();
    }
    function gridColor() { return document.documentElement.dataset.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; }
    const tooltip = document.getElementById('tooltip');
    const externalTooltip = (context) => {
      const { chart, tooltip: t } = context;
      if (t.opacity === 0) { tooltip.style.opacity = 0; return; }
      tooltip.innerHTML = `<div class="tooltip-label">${t.title[0]}</div>${t.body.map(b=>`<div class="tooltip-value">${b.lines[0]}</div>`).join('')}`;
      const { offsetLeft, offsetTop } = chart.canvas;
      tooltip.style.opacity = 1;
      tooltip.style.left = offsetLeft + t.caretX + 12 + 'px';
      tooltip.style.top = offsetTop + t.caretY - 12 + 'px';
    };
    window.chart = new Chart(document.getElementById('chart'), {
      type: '{type}',
      data: {
        labels: {labels},
        datasets: [{
          label: '{series label}',
          data: {data},
          backgroundColor: COLORS[0],
          borderColor: COLORS[0],
          borderWidth: 2,
          borderRadius: 4,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false, external: externalTooltip },
        },
        scales: {
          x: { grid: { color: gridColor() }, border: { display: false }, ticks: { font: { family: 'Outfit', size: 11 }, color: '#86868b' } },
          y: { grid: { color: gridColor() }, border: { display: false }, beginAtZero: true, ticks: { font: { family: 'Outfit', size: 11 }, color: '#86868b' } },
        },
      },
    });
  </script>
</body>
</html>
```

---

## Slide Decks

**Library:** Reveal.js 4 via CDN. Charts embedded inline with Chart.js.

**Always:**
- Speaker notes in `<aside class="notes">` on every slide
- Dark background default, light mode toggle via button
- `hash: true` in `Reveal.initialize`
- Notes plugin included — `S` opens speaker view
- Teal left-border accent on h1, teal bottom-border on h2
- Slide entrance: `fade` transition

**Deck HTML template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{deck title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.css">
<style>
  :root {
    --accent: #00d4aa; --accent-soft: rgba(0,212,170,0.08);
    --r-background-color: #0f0f11;
    --r-main-color: #f5f5f7;
    --r-main-font: 'Outfit', -apple-system, sans-serif;
    --r-heading-font: 'Outfit', -apple-system, sans-serif;
    --r-heading-color: #f5f5f7;
    --border-card: rgba(255,255,255,0.06);
    --grid-color: rgba(255,255,255,0.05);
    --text-secondary: #86868b;
  }
  .reveal h1 { font-size: 2em; font-weight: 600; letter-spacing: -0.03em; border-left: 4px solid var(--accent); padding-left: 0.4em; }
  .reveal h2 { font-size: 1.3em; font-weight: 600; letter-spacing: -0.02em; border-bottom: 2px solid var(--accent); padding-bottom: 0.2em; margin-bottom: 0.7em; }
  .reveal .subtitle { color: var(--accent); font-size: 1em; font-weight: 400; margin-top: 0.5em; }
  .reveal ul { list-style: none; padding: 0; }
  .reveal ul li { padding: 0.35em 0 0.35em 1.5em; position: relative; font-size: 0.9em; }
  .reveal ul li::before { content: '▸'; position: absolute; left: 0; color: var(--accent); }
  .reveal ul li.nested { padding-left: 2.8em; font-size: 0.8em; color: var(--text-secondary); }
  .reveal ul li.nested::before { left: 1.4em; content: '–'; }
  .reveal .chart-wrap { height: 50vh; position: relative; }
  .reveal .caption { font-size: 0.65em; color: var(--text-secondary); margin-top: 0.5em; font-style: italic; }
  .reveal .glass-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border-card); border-radius: 1.25rem; padding: 1.5rem; backdrop-filter: blur(20px); }
</style>
</head>
<body>
<div class="reveal"><div class="slides">
  <!-- slides go here -->
</div></div>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.js"></script>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@4/plugin/notes/notes.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
  Reveal.initialize({ hash: true, transition: 'fade', plugins: [RevealNotes] });
  const COLORS = ['#00d4aa','#0a84ff','#bf5af2','#ff9f0a','#ff453a'];
</script>
</body>
</html>
```

---

## Output Rules

1. Always output a **complete, runnable HTML file** — no placeholders, no `// TODO`, no missing data.
2. Use real or clearly labelled example data if the user hasn't provided any.
3. Single chart → one minimal HTML file. Deck → one HTML file with all slides and charts embedded inline.
4. Always include the dark/light theme toggle button.
5. After the HTML, note how to open it and (for decks) that `S` opens speaker view.
6. If asked to **save the file**, write it to disk and confirm the path.
