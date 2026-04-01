# mcp-chart-forge

A professional chart generation MCP server for Claude Code. Drop a `charts-theme.json` into any project and Claude can generate beautiful, on-brand charts output as slide-ready PNG and SVG files — fully local, no API keys required.

## How it works

1. You add `mcp-chart-forge` to your Claude Code MCP config (once)
2. You drop a `charts-theme.json` into your project root (optional — ships with sensible defaults)
3. Claude generates charts via natural language: _"Make a bar chart of Q1 revenue by region"_
4. PNG + SVG files land in `./charts/` (or wherever your theme configures)

The server uses [Vega-Lite](https://vega.github.io/vega-lite/) for chart specs and [sharp](https://sharp.pixelplumbing.com/) for server-side PNG rendering — no browser, no Electron, no API keys.

---

## Installation

### 1. Install dependencies and build

```bash
git clone https://github.com/you/mcp-chart-forge.git
cd mcp-chart-forge
npm install
npm run build
```

### 2. Add to Claude Code

```bash
claude mcp add --transport stdio chart-forge -- node /absolute/path/to/mcp-chart-forge/dist/index.js
```

Replace `/absolute/path/to/mcp-chart-forge` with the actual path on your machine.

#### Or add manually to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "chart-forge": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-chart-forge/dist/index.js"]
    }
  }
}
```

### 3. Set up your theme (optional)

```bash
cp /path/to/mcp-chart-forge/charts-theme.example.json ./charts-theme.json
# Edit charts-theme.json to match your brand colors, fonts, and output size
```

`chart-forge` walks up the directory tree from wherever Claude Code is running, so placing `charts-theme.json` at your project root (or monorepo root) is all you need.

---

## Available tools

| Tool | Description |
|------|-------------|
| `generate_bar_chart` | Bar chart (vertical or horizontal, optionally grouped/stacked) |
| `generate_line_chart` | Line chart with optional multiple series, smoothing |
| `generate_area_chart` | Area chart with optional stacking |
| `generate_donut_chart` | Donut/ring chart |
| `generate_scatter_chart` | Scatter plot with optional bubble size, labels, and trendline |

### Common parameters (all tools)

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `object[]` | Array of data objects |
| `xField` | `string` | Field name for X axis |
| `yField` | `string` | Field name for Y axis |
| `title` | `string` | Chart title |
| `subtitle` | `string?` | Optional subtitle |
| `colorField` | `string?` | Field for color grouping |
| `outputName` | `string?` | Filename stem (defaults to `slugified-title-{timestamp}`) |
| `format` | `"png" \| "svg" \| "both"` | Output format (default: `"both"`) |

### Tool-specific parameters

**`generate_bar_chart`**
- `horizontal`: `boolean` — render as horizontal bars (default: `false`)

**`generate_line_chart`**
- `xType`: `"temporal" | "ordinal" | "quantitative"` — X axis field type (default: `"ordinal"`)
- `smooth`: `boolean` — apply monotone curve smoothing (default: `false`)

**`generate_area_chart`**
- `xType`: same as line chart
- `stacked`: `boolean` — stack series instead of overlapping (default: `false`)

**`generate_donut_chart`**
- `innerRadiusRatio`: `number` 0.1–0.9 — hole size as fraction of outer radius (default: `0.55`)

**`generate_scatter_chart`**
- `sizeField`: `string?` — field for bubble size (creates a bubble chart)
- `labelField`: `string?` — field for point labels
- `showTrendline`: `boolean` — overlay a linear regression line (default: `false`)

---

## Theme file reference

```jsonc
// charts-theme.json
{
  // Brand colors — used as the categorical color range for all charts
  "palette": ["#1B4F8A", "#E8A020", "#4CAF8A", "#C94040", "#7B5EA7"],

  "background": "#FFFFFF",
  "fontFamily": "sans-serif",

  "fontSize": {
    "title":      20,   // Chart title
    "subtitle":   14,   // Chart subtitle
    "axis":       12,   // Axis labels and titles
    "legend":     12,   // Legend labels
    "annotation": 11    // In-chart labels
  },

  "fontWeight": {
    "title":    "bold",
    "subtitle": "normal"
  },

  "textColor":  "#1A1A1A",   // All text
  "axisColor":  "#CCCCCC",   // Axis lines and ticks
  "gridColor":  "#F0F0F0",   // Grid lines

  "padding": { "top": 48, "right": 40, "bottom": 56, "left": 64 },

  "outputSize": {
    "width":  1920,   // Output PNG width in pixels
    "height": 1080,   // Output PNG height in pixels
    "scale":  1       // Use 2 for @2x / HiDPI
  },

  "outputDir": "./charts",   // Relative to project root (process.cwd())

  "logoPath": null            // Reserved for future logo overlay support
}
```

---

## Example prompts for Claude

```
Generate a bar chart of monthly revenue.
Data: Jan $42k, Feb $38k, Mar $51k, Apr $49k, May $63k

Make a line chart comparing website traffic vs conversions over the last 6 months.
Use "month" for X, "visitors" and "conversions" as separate series via colorField.

Create a donut chart showing market share:
Company A 38%, Company B 27%, Company C 19%, Others 16%

Generate a scatter plot of marketing spend vs revenue, with company name labels,
and show a trendline.
```

---

## Troubleshooting

### `Could not load the "sharp" module` on Windows

Sharp ships prebuilt binaries per-platform. If you see this error, force the Windows x64 binary:

```bash
npm install --os=win32 --cpu=x64 sharp
```

Then rebuild: `npm run build`.

### `Could not load the "sharp" module` on macOS (Apple Silicon)

```bash
npm install --os=darwin --cpu=arm64 sharp
```

---

## Development

```bash
npm run dev      # Run via ts-node (no build step)
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled output
```

## Tech stack

- **[Vega-Lite](https://vega.github.io/vega-lite/)** — declarative chart spec compiler
- **[Vega](https://vega.github.io/vega/)** — rendering engine (`view.toSVG()` — no canvas/browser needed)
- **[sharp](https://sharp.pixelplumbing.com/)** — SVG → PNG via libvips (prebuilt binaries, no native compilation)
- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)** — MCP server + tool registration
- **[Zod](https://zod.dev/)** — tool input validation

## License

MIT
