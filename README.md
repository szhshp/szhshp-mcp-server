# szhshp-next-mcp


- Reference
  - [Vercel MCP Adapter](https://www.npmjs.com/package/mcp-handler)
  - [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)


## Vercel 部署注意事项

- 如需使用 SSE 传输，需在项目中配置 Redis（环境变量 `process.env.REDIS_URL`），并在 `app/mcp/route.ts` 中将 `disableSse` 设置为 `false`
- 请确保已启用 [Fluid compute](https://vercel.com/docs/functions/fluid-compute) 以获得高效执行
- 启用 Fluid compute 后，若为 Vercel Pro 或 Enterprise 账号，请在 `app/route.ts` 中将 `maxDuration` 调整为 800
- [部署 Next.js MCP 模板](https://vercel.com/templates/next.js/model-context-protocol-mcp-with-next-js)
