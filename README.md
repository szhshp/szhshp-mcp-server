# szhshp-next-mcp


- Reference
  - [Vercel MCP Adapter](https://www.npmjs.com/package/mcp-handler)
  - [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)


# Usage

先跑起 Server: `npm run dev` 或者 `vercel dev`



```json
{
  "mcpServers": {
    "server-name": {
      "url": "https://my-mcp-server.vercel.app/mcp", 
      /* Example:   
        "http://localhost:3000/api/mcp" 
        This is your app/api/[transport]/route.ts 
      */
    }
  }
}
```


## Route 配置

- `{RouterPath}/[transport]/route.ts`
  - Example:
    - `http://localhost:3000/api/test/mcp` => `app/api/test/mcp/route.ts`
    - `http://localhost:3000/api/mcp` => `app/api/mcp/route.ts`
  - **必须要用 `[transport]` 来表示 MCP 的传输方式** 因此必须要有一个 `/mcp` 作为 Route 的结尾


## Vercel 部署注意事项

- 如需使用 SSE 传输, 需在项目中配置 Redis (环境变量 `process.env.REDIS_URL` ) , 并在 `app/mcp/route.ts` 中将 `disableSse` 设置为 `false` 
- 请确保已启用 [Fluid compute](https://vercel.com/docs/functions/fluid-compute) 以获得高效执行
- 启用 Fluid compute 后, 若为 Vercel Pro 或 Enterprise 账号, 请在 `app/route.ts` 中将 `maxDuration` 调整为 800
- [部署 Next.js MCP 模板](https://vercel.com/templates/next.js/model-context-protocol-mcp-with-next-js)



## Debug

```bash
# Inspector, 不太好用
npx @modelcontextprotocol/inspector@latest http://localhost:3000
```


## MCP 

配置起来很简单, 在 MCP 菜单添加配置, 然后就可以在对话中直接使用 Tools:

```json
"szhshp-mcp-game": {
  "url": "http://mcp.szhshp.com/games/mcp"
},
```

## Plugins

只列出一些关键的 Plugins:

### ai-reminder


```sh
/rmd ls # 列出当前群里面的 Reminder
/rmdg ls {群号} # 列出特定群里面的 Reminder
/rmdg ls 111111111 # 列出群 111111111 里面的 Reminder
```


```sh
# 在群 222222222 中添加一个每天 21:50 执行 `MCP Tool: get_news` 并且参数是 thepaper 
/rmdg command 222222222 /get_news--thepaper 21:50 daily 

/rmdg command 333333333 /get_news--thepaper 11:00 daily
/rmdg command 111111111 /get_news--thepaper 10:00 daily

# 执行一次 `MCP Tool: game_tool` 并且参数是 freeGame_epic 
/rmdg command 222222222 /game_tool--freeGame_epic 22:09
/rmdg command 333333333 /game_tool--freeGame_epic 12:00 daily
/rmdg rm 222222222 1
```
