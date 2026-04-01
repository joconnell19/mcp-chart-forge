import { z } from 'zod/v3';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { buildLineChartSpec } from '../core/charts';
import { renderAndSave } from '../core/renderer';
import { ChartTheme } from '../core/types';

const schema = z.object({
  data: z.array(z.record(z.unknown())).describe('Array of data objects'),
  xField: z.string().describe('Field name for the X axis (time or ordinal categories)'),
  yField: z.string().describe('Field name for the Y axis (values)'),
  title: z.string().describe('Chart title'),
  subtitle: z.string().optional().describe('Optional subtitle'),
  colorField: z.string().optional().describe('Field name for color grouping (multiple lines)'),
  outputName: z.string().optional().describe('Output filename stem'),
  format: z.enum(['png', 'svg', 'both']).optional().default('both').describe('Output format'),
  xType: z.enum(['temporal', 'ordinal', 'quantitative']).optional().default('ordinal').describe('X axis field type'),
  smooth: z.boolean().optional().default(false).describe('Apply curve smoothing to lines'),
});

type Args = z.infer<typeof schema>;

export function registerLineChart(server: McpServer, getTheme: () => ChartTheme): void {
  server.tool(
    'generate_line_chart',
    'Generate a professional line chart (with optional multiple series) and save as PNG and/or SVG',
    schema.shape,
    async (args) => {
      const theme = getTheme();
      const a = args as Args;
      const spec = buildLineChartSpec(a, theme);
      const output = await renderAndSave(spec, a, theme);

      const lines = ['Line chart generated successfully.'];
      if (output.pngPath) lines.push(`PNG: ${output.pngPath}`);
      if (output.svgPath) lines.push(`SVG: ${output.svgPath}`);

      const svgDataUri = output.svgContent
        ? `![${a.title}](data:image/svg+xml;base64,${Buffer.from(output.svgContent).toString('base64')})`
        : '';

      return {
        content: [
          { type: 'text', text: [lines.join('\n'), svgDataUri].filter(Boolean).join('\n\n') },
        ],
      };
    },
  );
}
