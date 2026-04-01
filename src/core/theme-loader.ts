import * as fs from 'fs';
import * as path from 'path';
import { ChartTheme } from './types';

const DEFAULT_THEME: ChartTheme = {
  palette: ['#1B4F8A', '#E8A020', '#4CAF8A', '#C94040', '#7B5EA7'],
  background: '#FFFFFF',
  fontFamily: 'sans-serif',
  fontSize: {
    title: 20,
    subtitle: 14,
    axis: 12,
    legend: 12,
    annotation: 11,
  },
  fontWeight: {
    title: 'bold',
    subtitle: 'normal',
  },
  textColor: '#1A1A1A',
  axisColor: '#CCCCCC',
  gridColor: '#F0F0F0',
  padding: { top: 48, right: 40, bottom: 56, left: 64 },
  outputSize: { width: 1200, height: 675, scale: 1 },
  outputDir: './charts',
  logoPath: null,
};

const REQUIRED_KEYS: (keyof ChartTheme)[] = [
  'palette',
  'background',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'textColor',
  'axisColor',
  'gridColor',
  'padding',
  'outputSize',
  'outputDir',
];

function validate(raw: unknown): ChartTheme {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('charts-theme.json must be a JSON object');
  }

  const obj = raw as Record<string, unknown>;

  for (const key of REQUIRED_KEYS) {
    if (!(key in obj)) {
      throw new Error(`charts-theme.json is missing required key: "${key}"`);
    }
  }

  if (!Array.isArray(obj.palette) || obj.palette.length === 0) {
    throw new Error('charts-theme.json: "palette" must be a non-empty array of color strings');
  }

  const outputSize = obj.outputSize as Record<string, unknown>;
  if (
    typeof outputSize?.width !== 'number' ||
    typeof outputSize?.height !== 'number' ||
    typeof outputSize?.scale !== 'number'
  ) {
    throw new Error('charts-theme.json: "outputSize" must have numeric width, height, and scale');
  }

  // Merge with defaults to fill in any optional keys
  return { ...DEFAULT_THEME, ...(raw as ChartTheme) };
}

/**
 * Walk up the directory tree from startDir, looking for charts-theme.json.
 * Falls back to the built-in default theme if no file is found.
 */
export function loadTheme(startDir: string = process.cwd()): ChartTheme {
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, 'charts-theme.json');

    if (fs.existsSync(candidate)) {
      try {
        const raw = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        const theme = validate(raw);
        // Anchor relative outputDir to the theme file's directory so the server
        // works regardless of process.cwd() (e.g. when launched by Claude Desktop
        // with cwd = C:\WINDOWS\System32).
        if (!path.isAbsolute(theme.outputDir)) {
          theme.outputDir = path.resolve(path.dirname(candidate), theme.outputDir);
        }
        process.stderr.write(`[chart-forge] Loaded theme from: ${candidate}\n`);
        return theme;
      } catch (err) {
        throw new Error(
          `[chart-forge] Found charts-theme.json at ${candidate} but it is invalid: ${(err as Error).message}`
        );
      }
    }

    const parent = path.dirname(current);
    if (parent === current) {
      // Reached the filesystem root — use default theme
      process.stderr.write('[chart-forge] No charts-theme.json found; using default theme\n');
      const theme = { ...DEFAULT_THEME };
      // __dirname is dist/core/ at runtime — go up two levels to the project root
      if (!path.isAbsolute(theme.outputDir)) {
        theme.outputDir = path.resolve(__dirname, '../..', theme.outputDir);
      }
      return theme;
    }

    current = parent;
  }
}
