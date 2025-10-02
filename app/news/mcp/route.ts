import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

interface Context {
  type:
    | 'bilibili'
    | 'baidu'
    | 'zhihu'
    | 'tieba'
    | 'sspai'
    | 'ithome'
    | 'thepaper'
    | 'toutiao'
    | 'weibo'
    | '36kr'
    | 'juejin'
    | 'qq-news'
}

const handler = async (
  context: Context
): Promise<{
  content: Array<{ type: 'text'; text: string }>
}> => {
  // Map platform types to Chinese titles for the new API
  const titleMap: Record<string, string> = {
    bilibili: '哔哩哔哩',
    baidu: '百度',
    zhihu: '知乎',
    tieba: '百度贴吧',
    sspai: '少数派',
    ithome: 'IT之家',
    thepaper: '澎湃新闻',
    toutiao: '今日头条',
    weibo: '微博热搜',
    '36kr': '36氪',
    juejin: '稀土掘金',
    'qq-news': '腾讯新闻',
  }

  const title = titleMap[context.type] || '腾讯新闻'
  const res = await fetch(
    `https://api.pearktrue.cn/api/dailyhot/?title=${encodeURIComponent(title)}`
  )
  const data = await res.json()
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data) }],
  }
}

const tool = createMcpHandler(
  (server) => {
    server.tool(
      'get_news',
      'Get news data from various platforms, 获取各平台新闻数据',
      {
        type: z
          .enum([
            'bilibili',
            'baidu',
            'zhihu',
            'tieba',
            'sspai',
            'ithome',
            'thepaper',
            'toutiao',
            'weibo',
            '36kr',
            'juejin',
            'qq-news',
          ])
          .describe(`
**Select the news type to fetch.**

**Available platforms:**
- bilibili: 哔哩哔哩
- baidu: 百度
- zhihu: 知乎
- tieba: 百度贴吧
- sspai: 少数派
- ithome: IT之家
- thepaper: 澎湃新闻
- toutiao: 今日头条
- weibo: 微博热搜
- 36kr: 36氪
- juejin: 稀土掘金
- qq-news: 腾讯新闻

**Example:**
{ "type": "bilibili" }
        `),
      },
      handler
    )
  },
  {
    capabilities: {
      tools: {
        get_news: {
          description: 'Get news data from various platforms, 获取各平台新闻数据',
        },
      },
    },
  },
  { basePath: '/news/' }
)

export { tool as GET, tool as POST, tool as DELETE }
