import { createMcpHandler } from 'mcp-handler'

const handler = async (): Promise<{
  content: Array<{ type: 'text'; text: string }>
}> => {
  const res = await fetch('https://api.tangdouz.com/a/steam.php?return=json')
  const data = await res.json()
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data) }],
  }
}

const tool = createMcpHandler(
  (server: any) => {
    server.tool(
      'get_free_game',
      'Get the free game from Epic/Steam Games, 获取免费的Epic/Steam喜加一游戏',
      {},
      handler
    )
  },
  {},
  { basePath: '/freeGame/' }
)

export { tool as GET, tool as POST, tool as DELETE }
