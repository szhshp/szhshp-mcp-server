import { MetacriticScraper } from '@/src/scrapers/metacritic-scraper'
import { createMcpHandler } from 'mcp-handler'

const handler = async (): Promise<{
  content: Array<{ type: 'text'; text: string }>
}> => {
  const scraper = new MetacriticScraper()
  const newReleases = await scraper.scrapeNewReleases()
  return {
    content: [{ type: 'text' as const, text: `New game releases: ${JSON.stringify(newReleases)}` }],
  }
}

const tool = createMcpHandler(
  (server: any) => {
    server.tool(
      'search_game_metacritic_score',
      'Search for a game on Metacritic with given keyword and return the score',
      {},
      handler
    )
  },
  {},
  { basePath: '/metacritic/search/' }
)

export { tool as GET, tool as POST, tool as DELETE }
