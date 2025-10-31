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

    const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${max_results}&sortBy=submittedDate&sortOrder=descending`

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
      `Search arXiv for academic papers using various search prefixes`,
      {
        prefix: z.enum(['ti', 'au', 'abs', 'co', 'jr', 'cat', 'rn', 'id', 'all']).describe(`
**Search prefix to use:**

- ti: Title
- au: Author
- abs: Abstract
- co: Comment
- jr: Journal Reference
- cat: Subject Category
  - cat:cs: Computer Science
    - cat:cs.AI: Artificial Intelligence
    - cat:cs.AR: Hardware Architecture
    - cat:cs.CC: Computational Complexity
    - cat:cs.CE: Computational Engineering, Finance, and Science
    - cat:cs.CG: Computational Geometry
    - cat:cs.CL: Computation and Language
    - cat:cs.CR: Cryptography and Security
    - cat:cs.CV: Computer Vision and Pattern Recognition
    - cat:cs.CY: Computers and Society
    - cat:cs.DB: Databases
    - cat:cs.DC: Distributed, Parallel, and Cluster Computing
    - cat:cs.DL: Digital Libraries
    - cat:cs.DM: Discrete Mathematics
    - cat:cs.DS: Data Structures and Algorithms
    - cat:cs.ET: Emerging Technologies
    - cat:cs.FL: Formal Languages and Automata Theory
    - cat:cs.GL: General Literature
    - cat:cs.GR: Graphics
    - cat:cs.GT: Computer Science and Game Theory
    - cat:cs.HC: Human-Computer Interaction
    - cat:cs.IR: Information Retrieval
    - cat:cs.IT: Information Theory
    - cat:cs.LG: Machine Learning
    - cat:cs.LO: Logic in Computer Science
    - cat:cs.MA: Multiagent Systems
    - cat:cs.MM: Multimedia
    - cat:cs.MS: Mathematical Software
    - cat:cs.NA: Numerical Analysis
    - cat:cs.NE: Neural and Evolutionary Computing
    - cat:cs.NI: Networking and Internet Architecture
    - cat:cs.OH: Other Computer Science
    - cat:cs.OS: Operating Systems
    - cat:cs.PF: Performance
    - cat:cs.PL: Programming Languages
    - cat:cs.RO: Robotics
    - cat:cs.SC: Symbolic Computation
    - cat:cs.SD: Sound
    - cat:cs.SE: Software Engineering
    - cat:cs.SI: Social and Information Networks
    - cat:cs.SY: Systems and Control
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
