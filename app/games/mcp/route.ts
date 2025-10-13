import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { MetacriticScraper } from '@/src/scrapers/metacritic-scraper'

interface Context {
  type: 'freeGame_epic' | 'newGame_metacritic' | 'search_metacritic' | 'newGame_switch2'
  keyword?: string
}

const handler = async (
  context: Context
): Promise<{
  content: Array<{ type: 'text'; text: string }>
}> => {
  switch (context.type) {
    case 'freeGame_epic': {
      const res = await fetch('https://api.tangdouz.com/a/steam.php?return=json')
      const data = await res.json()
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data) }],
      }
    }
    case 'newGame_switch2': {
      const scraper = new MetacriticScraper()
      const newReleases = await scraper.scrapeNewSwich2Release()
      return {
        content: [
          { type: 'text' as const, text: `New game releases: ${JSON.stringify(newReleases)}` },
        ],
      }
    }
    case 'newGame_metacritic': {
      const scraper = new MetacriticScraper()
      const newReleases = await scraper.scrapeNewReleases()
      return {
        content: [
          { type: 'text' as const, text: `New game releases: ${JSON.stringify(newReleases)}` },
        ],
      }
    }
    case 'search_metacritic': {
      const scraper = new MetacriticScraper()
      const searchResults = await scraper.scrapeSearch(context.keyword ?? '')
      return {
        content: [
          { type: 'text' as const, text: `Search results: ${JSON.stringify(searchResults)}` },
        ],
      }
    }
    default:
      return {
        content: [{ type: 'text', text: 'Invalid type specified' }],
      }
  }
}

// StreamableHttp server
const tool = createMcpHandler(
  async (server) => {
    server.tool(
      'game_tool',
      'Multi-purpose game tool for Epic/Steam free games and Metacritic data',
      {
        type: z
          .enum(['freeGame_epic', 'newGame_metacritic', 'search_metacritic', 'newGame_switch2'])
          .describe(`
**Select the type of game tool to use.**

- freeGame_epic: 
    - Get free Epic or Steam games
- newGame_metacritic: 
    - Fetch new game releases from Metacritic
- search_metacritic: 
    - Search for a game on Metacritic
- newGame_switch2: 
    - Fetch new Nintendo Switch 2 game releases from Metacritic

**Example:**
Example input (JSON):
{ "type": "search_metacritic", "keyword": "cyberpunk" }

          `),
        keyword: z
          .string()
          .optional()
          .describe('Required for search_metacritic type. The game name or keyword to search for.'),
      },
      handler
    )
  },
  {
    capabilities: {
      tools: {
        game_tool: {
          description: 'Multi-purpose game tool for Epic/Steam free games and Metacritic data',
        },
      },
    },
  },
  {
    basePath: '/games/',
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
)

export { tool as GET, tool as POST, tool as DELETE }
