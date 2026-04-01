import { z } from 'zod/v3';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { buildDeckHtml, writeDeckFile } from '../core/deck-builder';
import { ChartTheme } from '../core/types';

const slideSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('title'),
    heading: z.string().describe('Slide heading'),
    subheading: z.string().optional().describe('Optional subheading'),
    notes: z.string().optional().describe('Presenter notes'),
  }),
  z.object({
    type: z.literal('bullets'),
    heading: z.string().describe('Slide heading'),
    bullets: z.array(z.string()).describe('Bullet point strings (prefix with "  -" for nested)'),
    notes: z.string().optional().describe('Presenter notes'),
  }),
  z.object({
    type: z.literal('chart'),
    heading: z.string().describe('Slide heading'),
    chartPath: z.string().describe('Absolute or relative path to the SVG chart file'),
    caption: z.string().optional().describe('Optional caption below the chart'),
    notes: z.string().optional().describe('Presenter notes'),
  }),
  z.object({
    type: z.literal('content'),
    heading: z.string().describe('Slide heading'),
    body: z.string().describe('Body content — raw HTML supported for rich formatting'),
    notes: z.string().optional().describe('Presenter notes'),
  }),
]);

const schema = z.object({
  title: z.string().describe('Deck title (used as HTML page title and default filename stem)'),
  subtitle: z.string().optional().describe('Optional deck subtitle'),
  outputName: z.string().optional().describe('Output filename stem — defaults to slugified title + timestamp'),
  slides: z.array(slideSchema).describe('Array of slide definitions'),
});

type Args = z.infer<typeof schema>;

export function registerDeck(server: McpServer, getTheme: () => ChartTheme): void {
  server.tool(
    'generate_deck',
    'Generate a Reveal.js HTML slide deck with charts, bullets, and presenter notes. Press S in the browser for speaker view.',
    schema.shape,
    async (args) => {
      const theme = getTheme();
      const a = args as Args;
      const html = buildDeckHtml(a, theme);
      const deckPath = await writeDeckFile(html, a, theme);

      return {
        content: [
          {
            type: 'text',
            text: [
              'Deck generated successfully.',
              `File: ${deckPath}`,
              `Preview: chart-forge preview "${deckPath}"`,
              'Tip: Press S in the browser to open speaker view with notes.',
            ].join('\n'),
          },
        ],
      };
    },
  );
}
