import { createMcpHandler } from 'mcp-handler'

const handler = async (): Promise<{
  content: Array<{ type: 'text'; text: string }>
}> => {
  const res = await fetch('https://api.tangdouz.com/a/60/')
  const data = await res.text()
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data) }],
  }
}

const tool = createMcpHandler(
  (server: any) => {
    server.tool('get_news', 'Get news images link, 获取新闻图片链接', {}, handler)
  },
  {},
  { basePath: '/news/' }
)

export { tool as GET, tool as POST, tool as DELETE }
