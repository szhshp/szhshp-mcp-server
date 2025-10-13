import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

interface Context {
  prefix: 'ti' | 'au' | 'abs' | 'co' | 'jr' | 'cat' | 'rn' | 'id' | 'all'
  search_string: string
  max_results?: number
}

const handler = async (
  context: Context
): Promise<{
  content: Array<{ type: 'text'; text: string }>
}> => {
  try {
    const { prefix, search_string, max_results = 10 } = context

    // Build the arXiv API query
    let searchQuery = ''
    if (prefix === 'all') {
      searchQuery = `all:${encodeURIComponent(search_string)}`
    } else {
      searchQuery = `${prefix}:${encodeURIComponent(search_string)}`
    }

    const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${max_results}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`arXiv API request failed: ${response.statusText}`)
    }

    const xmlData = await response.text()

    // Parse XML to extract relevant information
    const entries = xmlData.match(/<entry>([\s\S]*?)<\/entry>/g) || []

    const results = entries.map((entry) => {
      const getTag = (tag: string): string => {
        const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
        return match ? match[1].trim() : ''
      }

      const getAllTags = (tag: string): string[] => {
        const matches = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g')) || []
        return matches.map((m) => {
          const contentMatch = m.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
          return contentMatch ? contentMatch[1].trim() : ''
        })
      }

      return {
        id: getTag('id'),
        title: getTag('title').replace(/\n/g, ' ').replace(/\s+/g, ' '),
        authors: getAllTags('name'),
        summary: getTag('summary').replace(/\n/g, ' ').replace(/\s+/g, ' '),
        published: getTag('published'),
        updated: getTag('updated'),
        categories: getAllTags('category').map((cat) => {
          const termMatch = cat.match(/term="([^"]+)"/)
          return termMatch ? termMatch[1] : cat
        }),
        pdf_url: entry.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/)?.[1] || '',
      }
    })

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              query: { prefix, search_string, max_results },
              total_results: results.length,
              results,
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
          text: `Error searching arXiv: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    }
  }
}

// StreamableHttp server
const tool: ReturnType<typeof createMcpHandler> = createMcpHandler(
  async (server) => {
    server.tool(
      'arxiv_search',
      'Search arXiv for academic papers using various search prefixes',
      {
        prefix: z.enum(['ti', 'au', 'abs', 'co', 'jr', 'cat', 'rn', 'id', 'all']).describe(`
**Search prefix to use:**

- ti: Title
- au: Author
- abs: Abstract
- co: Comment
- jr: Journal Reference
- cat: Subject Category
- rn: Report Number
- id: Id (use id_list instead)
- all: All of the above

**Example:**
{ "prefix": "ti", "search_string": "quantum computing" }
          `),
        search_string: z.string().describe('The search query string'),
        max_results: z
          .number()
          .optional()
          .describe('Maximum number of results to return (default: 10)'),
      },
      handler
    )
  },
  {
    capabilities: {
      tools: {
        arxiv_search: {
          description: 'Search arXiv for academic papers using various search prefixes',
        },
      },
    },
  },
  {
    basePath: '/arxiv/',
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
)

export { tool as GET, tool as POST, tool as DELETE }
