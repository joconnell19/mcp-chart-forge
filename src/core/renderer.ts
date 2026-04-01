import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ChartTheme, ChartInput, ChartOutput } from './types';

// ─── Theme → Vega-Lite Config ─────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildVegaLiteConfig(theme: ChartTheme): Record<string, any> {
  return {
    background: theme.background,

    // Categorical color range pulls directly from the palette
    range: {
      category: theme.palette,
      ordinal: theme.palette,
    },

    // Strip the plot area border box
    view: {
      stroke: 'transparent',
    },

    // Axis styling — clean, minimal
    axis: {
      domainColor: theme.axisColor,
      domainWidth: 1,
      tickColor: theme.axisColor,
      tickSize: 4,
      tickWidth: 1,
      gridColor: theme.gridColor,
      gridDash: [3, 3],
      gridOpacity: 1,
      labelFont: theme.fontFamily,
      labelFontSize: theme.fontSize.axis,
      labelColor: theme.textColor,
      labelPadding: 6,
      titleFont: theme.fontFamily,
      titleFontSize: theme.fontSize.axis,
      titleFontWeight: 'normal' as const,
      titleColor: theme.textColor,
      titlePadding: 12,
    },

    // Title — left-anchored for a modern editorial feel
    title: {
      font: theme.fontFamily,
      fontSize: theme.fontSize.title,
      fontWeight: theme.fontWeight.title,
      color: theme.textColor,
      anchor: 'start',
      offset: 16,
      subtitleFont: theme.fontFamily,
      subtitleFontSize: theme.fontSize.subtitle,
      subtitleFontWeight: theme.fontWeight.subtitle,
      subtitleColor: theme.textColor,
      subtitlePadding: 6,
    },

    // Legend
    legend: {
      labelFont: theme.fontFamily,
      labelFontSize: theme.fontSize.legend,
      labelColor: theme.textColor,
      titleFont: theme.fontFamily,
      titleFontSize: theme.fontSize.legend,
      titleColor: theme.textColor,
      titleFontWeight: 'bold' as const,
      symbolSize: 100,
      columnPadding: 12,
      rowPadding: 4,
    },

    // Marks
    bar: {
      cornerRadiusTopLeft: 3,
      cornerRadiusTopRight: 3,
    },
    line: {
      strokeWidth: 2.5,
    },
    point: {
      size: 60,
      filled: true,
      strokeWidth: 0,
    },
    area: {
      opacity: 0.7,
    },
    arc: {
      stroke: theme.background,
      strokeWidth: 2,
    },
  };
}

// ─── Spec → SVG + PNG ─────────────────────────────────────────────────────────

export async function renderSpec(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec: Record<string, any>,
  theme: ChartTheme,
): Promise<{ svg: string; png: Buffer }> {
  // Compile Vega-Lite → Vega
  const vegaSpec = vegaLite.compile(spec as vegaLite.TopLevelSpec).spec;

  // Create a headless Vega view (no canvas dep needed for SVG output)
  const view = new vega.View(vega.parse(vegaSpec), {
    renderer: 'none',
  });

  await view.runAsync();

  // Render SVG at the requested scale factor
  const svg = await view.toSVG(theme.outputSize.scale);

  // Convert SVG → PNG using sharp (prebuilt libvips binaries, no native compilation)
  // Resize to exact target dimensions; maintain aspect ratio inside the frame
  const png = await sharp(Buffer.from(svg), { density: 144 })
    .resize({
      width: theme.outputSize.width,
      height: theme.outputSize.height,
      fit: 'contain',
      background: theme.background,
    })
    .flatten({ background: theme.background })
    .png({ compressionLevel: 6 })
    .toBuffer();

  return { svg, png };
}

// ─── Write Files ──────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export async function writeChartFiles(
  svg: string,
  png: Buffer,
  input: ChartInput,
  theme: ChartTheme,
): Promise<ChartOutput> {
  const stem = input.outputName ?? `${slugify(input.title)}-${Date.now()}`;
  const outDir = path.resolve(process.cwd(), theme.outputDir);

  await fs.mkdir(outDir, { recursive: true });

  const output: ChartOutput = {};
  output.svgContent = svg; // always available for inline display regardless of format
  const format = input.format ?? 'both';

  if (format === 'png' || format === 'both') {
    const pngPath = path.join(outDir, `${stem}.png`);
    await fs.writeFile(pngPath, png);
    output.pngPath = pngPath;
    output.pngBase64 = png.toString('base64');
  }

  if (format === 'svg' || format === 'both') {
    const svgPath = path.join(outDir, `${stem}.svg`);
    await fs.writeFile(svgPath, svg, 'utf8');
    output.svgPath = svgPath;

    // Provide base64 PNG for inline display even in SVG-only mode
    if (!output.pngBase64) {
      output.pngBase64 = png.toString('base64');
    }
  }

  return output;
}

// ─── High-level render + write helper ────────────────────────────────────────

export async function renderAndSave(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec: Record<string, any>,
  input: ChartInput,
  theme: ChartTheme,
): Promise<ChartOutput> {
  const { svg, png } = await renderSpec(spec, theme);
  return writeChartFiles(svg, png, input, theme);
}
