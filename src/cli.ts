#!/usr/bin/env node
import { Command, Option } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadTheme } from './core/theme-loader';
import { renderAndSave } from './core/renderer';
import { buildDeckHtml, writeDeckFile, SlideDefinition } from './core/deck-builder';
import {
  buildBarChartSpec,
  buildLineChartSpec,
  buildAreaChartSpec,
  buildDonutChartSpec,
  buildScatterChartSpec,
} from './core/charts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseData(raw: string | undefined, file: string | undefined): Record<string, unknown>[] {
  if (file) {
    const resolved = path.resolve(process.cwd(), file);
    return JSON.parse(fs.readFileSync(resolved, 'utf8')) as Record<string, unknown>[];
  }
  if (raw) {
    return JSON.parse(raw) as Record<string, unknown>[];
  }
  // Try reading stdin
  const stdin = fs.readFileSync('/dev/stdin', 'utf8').trim();
  if (stdin) return JSON.parse(stdin) as Record<string, unknown>[];
  throw new Error('No data provided. Use --data <json>, --data-file <path>, or pipe JSON to stdin.');
}

function printOutput(output: { pngPath?: string; svgPath?: string }, json: boolean): void {
  if (json) {
    process.stdout.write(JSON.stringify({ pngPath: output.pngPath, svgPath: output.svgPath }, null, 2) + '\n');
    return;
  }
  if (output.pngPath) process.stdout.write(`PNG: ${output.pngPath}\n`);
  if (output.svgPath) process.stdout.write(`SVG: ${output.svgPath}\n`);
}

// ─── Shared options ───────────────────────────────────────────────────────────

function addSharedOptions(cmd: Command): Command {
  return cmd
    .requiredOption('--title <text>', 'Chart title')
    .option('--subtitle <text>', 'Optional subtitle')
    .option('--color-field <field>', 'Field name for color grouping')
    .option('--output-name <stem>', 'Output filename stem (default: slugified title + timestamp)')
    .addOption(new Option('--format <format>', 'Output format').choices(['png', 'svg', 'both']).default('both'))
    .option('--data <json>', 'Inline JSON array of data objects')
    .option('--data-file <path>', 'Path to a JSON file containing the data array')
    .option('--json', 'Output file paths as JSON', false);
}

// ─── Program ──────────────────────────────────────────────────────────────────

const program = new Command()
  .name('chart-forge')
  .description('Generate professional charts as PNG and SVG from the command line')
  .version('1.0.0');

// ── bar ───────────────────────────────────────────────────────────────────────
addSharedOptions(
  program
    .command('bar')
    .description('Bar chart (vertical or horizontal)')
    .requiredOption('--x <field>', 'Field name for the X axis (categories)')
    .requiredOption('--y <field>', 'Field name for the Y axis (values)')
    .option('--horizontal', 'Render as horizontal bars', false),
).action(async (opts) => {
  const theme = loadTheme();
  const data = parseData(opts.data, opts.dataFile);
  const spec = buildBarChartSpec(
    { data, xField: opts.x, yField: opts.y, title: opts.title, subtitle: opts.subtitle,
      colorField: opts.colorField, outputName: opts.outputName, format: opts.format, horizontal: opts.horizontal },
    theme,
  );
  const output = await renderAndSave(spec, { data, xField: opts.x, yField: opts.y, title: opts.title,
    subtitle: opts.subtitle, colorField: opts.colorField, outputName: opts.outputName, format: opts.format }, theme);
  printOutput(output, opts.json);
});

// ── line ──────────────────────────────────────────────────────────────────────
addSharedOptions(
  program
    .command('line')
    .description('Line chart with optional multiple series')
    .requiredOption('--x <field>', 'Field name for the X axis')
    .requiredOption('--y <field>', 'Field name for the Y axis (values)')
    .addOption(new Option('--x-type <type>', 'X axis field type').choices(['temporal', 'ordinal', 'quantitative']).default('ordinal'))
    .option('--smooth', 'Apply monotone curve smoothing', false),
).action(async (opts) => {
  const theme = loadTheme();
  const data = parseData(opts.data, opts.dataFile);
  const spec = buildLineChartSpec(
    { data, xField: opts.x, yField: opts.y, title: opts.title, subtitle: opts.subtitle,
      colorField: opts.colorField, outputName: opts.outputName, format: opts.format,
      xType: opts.xType, smooth: opts.smooth },
    theme,
  );
  const output = await renderAndSave(spec, { data, xField: opts.x, yField: opts.y, title: opts.title,
    subtitle: opts.subtitle, colorField: opts.colorField, outputName: opts.outputName, format: opts.format }, theme);
  printOutput(output, opts.json);
});

// ── area ──────────────────────────────────────────────────────────────────────
addSharedOptions(
  program
    .command('area')
    .description('Area chart with optional stacking')
    .requiredOption('--x <field>', 'Field name for the X axis')
    .requiredOption('--y <field>', 'Field name for the Y axis (values)')
    .addOption(new Option('--x-type <type>', 'X axis field type').choices(['temporal', 'ordinal', 'quantitative']).default('ordinal'))
    .option('--stacked', 'Stack areas instead of overlapping', false),
).action(async (opts) => {
  const theme = loadTheme();
  const data = parseData(opts.data, opts.dataFile);
  const spec = buildAreaChartSpec(
    { data, xField: opts.x, yField: opts.y, title: opts.title, subtitle: opts.subtitle,
      colorField: opts.colorField, outputName: opts.outputName, format: opts.format,
      xType: opts.xType, stacked: opts.stacked },
    theme,
  );
  const output = await renderAndSave(spec, { data, xField: opts.x, yField: opts.y, title: opts.title,
    subtitle: opts.subtitle, colorField: opts.colorField, outputName: opts.outputName, format: opts.format }, theme);
  printOutput(output, opts.json);
});

// ── donut ─────────────────────────────────────────────────────────────────────
addSharedOptions(
  program
    .command('donut')
    .description('Donut / ring chart')
    .requiredOption('--x <field>', 'Field name for segment labels')
    .requiredOption('--y <field>', 'Field name for segment values (numeric)')
    .option('--inner-radius-ratio <ratio>', 'Inner radius as fraction of outer (0.1–0.9)', '0.55'),
).action(async (opts) => {
  const theme = loadTheme();
  const data = parseData(opts.data, opts.dataFile);
  const spec = buildDonutChartSpec(
    { data, xField: opts.x, yField: opts.y, title: opts.title, subtitle: opts.subtitle,
      outputName: opts.outputName, format: opts.format, innerRadiusRatio: parseFloat(opts.innerRadiusRatio) },
    theme,
  );
  const output = await renderAndSave(spec, { data, xField: opts.x, yField: opts.y, title: opts.title,
    subtitle: opts.subtitle, outputName: opts.outputName, format: opts.format }, theme);
  printOutput(output, opts.json);
});

// ── scatter ───────────────────────────────────────────────────────────────────
addSharedOptions(
  program
    .command('scatter')
    .description('Scatter plot with optional bubble size, labels, and trendline')
    .requiredOption('--x <field>', 'Field name for the X axis (quantitative)')
    .requiredOption('--y <field>', 'Field name for the Y axis (quantitative)')
    .option('--size-field <field>', 'Field name for bubble size')
    .option('--label-field <field>', 'Field name for point labels')
    .option('--trendline', 'Overlay a linear regression trendline', false),
).action(async (opts) => {
  const theme = loadTheme();
  const data = parseData(opts.data, opts.dataFile);
  const spec = buildScatterChartSpec(
    { data, xField: opts.x, yField: opts.y, title: opts.title, subtitle: opts.subtitle,
      colorField: opts.colorField, outputName: opts.outputName, format: opts.format,
      sizeField: opts.sizeField, labelField: opts.labelField, showTrendline: opts.trendline },
    theme,
  );
  const output = await renderAndSave(spec, { data, xField: opts.x, yField: opts.y, title: opts.title,
    subtitle: opts.subtitle, colorField: opts.colorField, outputName: opts.outputName, format: opts.format }, theme);
  printOutput(output, opts.json);
});

// ── deck ──────────────────────────────────────────────────────────────────────
program
  .command('deck')
  .description('Generate a Reveal.js HTML slide deck from a slides manifest')
  .requiredOption('--title <text>', 'Deck title')
  .option('--subtitle <text>', 'Optional deck subtitle')
  .option('--output-name <stem>', 'Output filename stem (default: slugified title + timestamp)')
  .option('--slides <json>', 'Inline JSON array of SlideDefinition objects')
  .option('--slides-file <path>', 'Path to a JSON file containing an array of SlideDefinitions')
  .option('--json', 'Output file path as JSON', false)
  .action(async (opts) => {
    const theme = loadTheme();
    let slides: SlideDefinition[];
    if (opts.slidesFile) {
      const resolved = path.resolve(process.cwd(), opts.slidesFile);
      slides = JSON.parse(fs.readFileSync(resolved, 'utf8')) as SlideDefinition[];
    } else if (opts.slides) {
      slides = JSON.parse(opts.slides) as SlideDefinition[];
    } else {
      process.stderr.write('Error: provide --slides <json> or --slides-file <path>\n');
      process.exit(1);
    }
    const input = { title: opts.title, subtitle: opts.subtitle, outputName: opts.outputName, slides };
    const html = buildDeckHtml(input, theme);
    const deckPath = await writeDeckFile(html, input, theme);
    if (opts.json) {
      process.stdout.write(JSON.stringify({ deckPath }, null, 2) + '\n');
    } else {
      process.stdout.write(`Deck: ${deckPath}\nPreview: chart-forge preview "${deckPath}"\n`);
    }
  });

// ── preview ───────────────────────────────────────────────────────────────────
program
  .command('preview <file>')
  .description('Open an HTML deck in a headed Chromium browser via Playwright')
  .action(async (file: string) => {
    const absPath = path.resolve(process.cwd(), file);
    // Dynamic require so the MCP server stays lightweight when playwright isn't installed.
    // Using require() (not import()) avoids static resolution errors when playwright
    // is absent — it's an optionalDependency.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let playwright: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      playwright = require('playwright');
    } catch {
      process.stderr.write(
        'Playwright is not installed. Run: npm install playwright && npx playwright install chromium\n',
      );
      process.exit(1);
    }
    const browser = await playwright.chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(`file://${absPath}`);
    process.stdout.write('Browser opened. Press S for speaker view. Close window to exit.\n');
    await browser.waitForEvent('disconnected');
  });

program.parseAsync(process.argv).catch((err: Error) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
