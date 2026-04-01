export interface ChartTheme {
  /** Color palette — used as the categorical color range for all charts */
  palette: string[];
  /** Chart background color */
  background: string;
  /** Font family applied to all text elements */
  fontFamily: string;
  /** Font sizes for different text roles */
  fontSize: {
    title: number;
    subtitle: number;
    axis: number;
    legend: number;
    annotation: number;
  };
  /** Font weights for title and subtitle */
  fontWeight: {
    title: string | number;
    subtitle: string | number;
  };
  /** Default text color for labels and annotations */
  textColor: string;
  /** Axis domain/tick line color */
  axisColor: string;
  /** Grid line color */
  gridColor: string;
  /** Padding around the chart view (outside the plot area) */
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Output image dimensions and pixel density */
  outputSize: {
    width: number;
    height: number;
    /** Scale multiplier — use 2 for @2x / HiDPI output */
    scale: number;
  };
  /** Directory to write chart files, relative to process.cwd() */
  outputDir: string;
  /** Optional path to a logo image to overlay — not yet implemented */
  logoPath: string | null;
}

export interface ChartInput {
  /** Array of data objects — each object is one data point */
  data: Record<string, unknown>[];
  /** Field name to map to the X axis */
  xField: string;
  /** Field name to map to the Y axis (or arc theta for donut) */
  yField: string;
  /** Chart title */
  title: string;
  /** Optional subtitle rendered below the title */
  subtitle?: string;
  /** Optional field name for color grouping */
  colorField?: string;
  /** Output filename stem — defaults to slugified title + timestamp */
  outputName?: string;
  /** Which formats to write — defaults to "both" */
  format?: 'png' | 'svg' | 'both';
}

export interface ChartOutput {
  /** Absolute path to the written PNG file, if applicable */
  pngPath?: string;
  /** Absolute path to the written SVG file, if applicable */
  svgPath?: string;
  /** Base64-encoded PNG for inline display in Claude */
  pngBase64?: string;
  /** Raw SVG string for inline display — avoids filesystem access in sandboxed environments */
  svgContent?: string;
}
