#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadTheme } from './core/theme-loader';
import { ChartTheme } from './core/types';
import { registerBarChart } from './tools/bar-chart';
import { registerLineChart } from './tools/line-chart';
import { registerAreaChart } from './tools/area-chart';
import { registerDonutChart } from './tools/donut-chart';
import { registerScatterChart } from './tools/scatter-chart';
import { registerDeck } from './tools/deck';

// ─── Theme cache ──────────────────────────────────────────────────────────────
// Loaded once at server start; the theme-loader walks up from process.cwd()
// which is set to the user's project root by Claude Code.

let cachedTheme: ChartTheme | null = null;

function getTheme(): ChartTheme {
  if (!cachedTheme) {
    cachedTheme = loadTheme();
  }
  return cachedTheme;
}

// ─── MCP Server ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const server = new McpServer({
    name: 'chart-forge',
    version: '1.0.0',
  });

  // Register all chart tools — each receives a theme getter so they stay
  // decoupled from the global theme cache.
  registerBarChart(server, getTheme);
  registerLineChart(server, getTheme);
  registerAreaChart(server, getTheme);
  registerDonutChart(server, getTheme);
  registerScatterChart(server, getTheme);
  registerDeck(server, getTheme);

  // Connect via stdio — Claude Code manages the process lifecycle
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write('[chart-forge] MCP server running on stdio\n');
}

main().catch((err) => {
  process.stderr.write(`[chart-forge] Fatal error: ${(err as Error).message}\n`);
  process.exit(1);
});
