import { z } from 'zod/v3';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { buildDonutChartSpec } from '../core/charts';
import { renderAndSave } from '../core/renderer';
import { ChartTheme } from '../core/types';

const schema = z.object({
  data: z.array(z.record(z.unknown())).describe('Array of data objects'),
  xField: z.string().describe('Field name for segment labels / categories'),
  yField: z.string().describe('Field name for segment values (must be numeric)'),
  title: z.string().describe('Chart title'),
  subtitle: z.string().optional().describe('Optional subtitle'),
  outputName: z.string().optional().describe('Output filename stem'),
  format: z.enum(['png', 'svg', 'both']).optional().default('both').describe('Output format'),
  innerRadiusRatio: z
    .number()
    .min(0.1)
    .max(0.9)
    .optional()
    .default(0.55)
    .describe('Inner radius as a fraction of outer radius (0.1 = thick, 0.9 = thin ring)'),
});

type Args = z.infer<typeof schema>;

export function registerDonutChart(server: McpServer, getTheme: () => ChartTheme): void {
  server.tool(
    'generate_donut_chart',
    'Generate a professional donut (ring) chart and save as PNG and/or SVG',
    schema.shape,
    async (args) => {
      const theme = getTheme();
      const a = args as Args;
      const spec = buildDonutChartSpec(a, theme);
      const output = await renderAndSave(spec, a, theme);

      const lines = ['Donut chart generated successfully.'];
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
