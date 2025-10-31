import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

interface Context {
  type: 'top' | 'new' | 'best' | 'show' | 'ask' | 'jobs'
  limit?: number
  item_id?: number
}

interface HackerNewsItem {
  id: number
  deleted?: boolean
  type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt'
  by?: string
  time: number
  text?: string
  dead?: boolean
  parent?: number
  poll?: number
  kids?: number[]
  url?: string
  score?: number
  title?: string
  parts?: number[]
  descendants?: number
}

const handler = async (
  context: Context
): Promise<{
  content: Array<{ type: 'text'; text: string }>
}> => {
  try {
    const { type, limit = 10, item_id } = context

    const baseUrl = 'https://hacker-news.firebaseio.com/v0'

    // If item_id is provided, fetch a specific item
    if (item_id) {
      const response = await fetch(`${baseUrl}/item/${item_id}.json`)
      if (!response.ok) {
        throw new Error(`Hacker News API request failed: ${response.statusText}`)
      }

      const item: HackerNewsItem = await response.json()

      if (!item || item.deleted) {
        throw new Error(`Item ${item_id} not found or deleted`)
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(item, null, 2),
          },
        ],
      }
    }

    // Otherwise, fetch a list of stories based on type
    const storyTypeMap: Record<string, string> = {
      top: 'topstories',
      new: 'newstories',
      best: 'beststories',
      show: 'showstories',
      ask: 'askstories',
      jobs: 'jobstories',
    }

    const endpoint = storyTypeMap[type] || 'topstories'
    const response = await fetch(`${baseUrl}/${endpoint}.json`)
    if (!response.ok) {
      throw new Error(`Hacker News API request failed: ${response.statusText}`)
    }

    const storyIds: number[] = await response.json()
    const limitedIds = storyIds.slice(0, limit)

    // Fetch details for each story
    const stories = await Promise.all(
      limitedIds.map(async (id) => {
        const itemResponse = await fetch(`${baseUrl}/item/${id}.json`)
        if (!itemResponse.ok) {
          return null
        }
        const item: HackerNewsItem = await itemResponse.json()
        return item
      })
    )

    // Filter out null values (failed fetches) and deleted items
    const validStories = stories.filter(
      (story): story is HackerNewsItem => story !== null && !story.deleted
    )

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              type,
              total_returned: validStories.length,
              stories: validStories,
            },
            null,
            2
          ),
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching Hacker News: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    }
  }
}

const tool: ReturnType<typeof createMcpHandler> = createMcpHandler(
  async (server) => {
    server.tool(
      'hackernews_get',
      'Get Hacker News stories or a specific item by ID',
      {
        type: z.enum(['top', 'new', 'best', 'show', 'ask', 'jobs']).describe(`
**Type of stories to fetch:**

- top: Top stories (default)
- new: Newest stories
- best: Best stories (highest voted)
- show: Show HN stories
- ask: Ask HN stories
- jobs: Job postings

**Example:**
{ "type": "top", "limit": 10 }
          `),
        limit: z
          .number()
          .optional()
          .describe('Maximum number of stories to return (default: 10, max: 500)'),
        item_id: z
          .number()
          .optional()
          .describe('Get a specific item by its ID. If provided, type and limit are ignored.'),
      },
      handler
    )
  },
  {
    capabilities: {
      tools: {
        hackernews_get: {
          description: 'Get Hacker News stories or a specific item by ID',
        },
      },
    },
  },
  {
    basePath: '/hackerNews/',
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
)

export { tool as GET, tool as POST, tool as DELETE }
