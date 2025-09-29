import { MetacriticScraper } from '@/src/scrapers/metacritic-scraper'
import { createMcpHandler } from 'mcp-handler'
import z from 'zod'

interface Context {
  keyword: string
}

const handler = async (
  context: Context
): Promise<{
  content: Array<{ type: 'text'; text: string }>
}> => {
  const scraper = new MetacriticScraper()
  const newReleases = await scraper.scrapeSearch(context.keyword ?? '')
  return {
    content: [{ type: 'text' as const, text: `New game releases: ${JSON.stringify(newReleases)}` }],
  }
}

const tool = createMcpHandler(
  (server: any) => {
    server.tool(
      'search_game_metacritic_score',
      'Search for a game on Metacritic with given keyword and return the score',
      {
        keyword: z.string(),
      },
      handler
    )
  },
  {
    capabilities: {
      tools: {
        search_game_metacritic_score: {
          description: 'Search for a game on Metacritic with given keyword and return the score',
        },
      },
    },
  },
  { basePath: '/metacritic/search/' }
)

export { tool as GET, tool as POST, tool as DELETE }
