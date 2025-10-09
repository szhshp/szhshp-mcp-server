# szhshp-next-mcp


- Reference
  - [Vercel MCP Adapter](https://www.npmjs.com/package/mcp-handler)
  - [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)


## Usage

```json
"szhshp-mcp-game": {
  "url": "http://mcp.szhshp.com/games/mcp"
},
```


# Debug

Run Server: `npm run dev` or `vercel dev`



```json
{
  "mcpServers": {
    "server-name": {
      "url": "http://localhost:3000/api/mcp" 
      /* Example:   
        "http://localhost:3000/api/mcp" 
        This is your app/api/[transport]/route.ts 
      */
    }
  }
}
```

```bash
# Inspector
npx @modelcontextprotocol/inspector@latest http://localhost:3000
```


