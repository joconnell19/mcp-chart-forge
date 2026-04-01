import { z } from 'zod/v3';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { buildScatterChartSpec } from '../core/charts';
import { renderAndSave } from '../core/renderer';
import { ChartTheme } from '../core/types';

const schema = z.object({
  data: z.array(z.record(z.unknown())).describe('Array of data objects'),
  xField: z.string().describe('Field name for the X axis (quantitative)'),
  yField: z.string().describe('Field name for the Y axis (quantitative)'),
  title: z.string().describe('Chart title'),
  subtitle: z.string().optional().describe('Optional subtitle'),
  colorField: z.string().optional().describe('Field name for color grouping'),
  sizeField: z.string().optional().describe('Field name for bubble size (creates a bubble chart)'),
  labelField: z.string().optional().describe('Field name for point labels'),
  outputName: z.string().optional().describe('Output filename stem'),
  format: z.enum(['png', 'svg', 'both']).optional().default('both').describe('Output format'),
  showTrendline: z.boolean().optional().default(false).describe('Overlay a linear regression trendline'),
});

type Args = z.infer<typeof schema>;

export function registerScatterChart(server: McpServer, getTheme: () => ChartTheme): void {
  server.tool(
    'generate_scatter_chart',
    'Generate a professional scatter plot (optionally a bubble chart or with trendline) and save as PNG and/or SVG',
    schema.shape,
    async (args) => {
      const theme = getTheme();
      const a = args as Args;
      const spec = buildScatterChartSpec(a, theme);
      const output = await renderAndSave(spec, a, theme);

      const lines = ['Scatter chart generated successfully.'];
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
