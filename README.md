# szhshp-next-mcp

- Reference
  - [Vercel MCP Adapter](https://www.npmjs.com/package/mcp-handler)
  - [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## Deploy

1. Deploy to Vercel
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fszhshp%2Fszhshp-next-mcp)
2. Add a ENV Variable `API_TOKEN` in Vercel


## Usage

Add MCP config to your client:

```json
"orchestration-mcp-exp": {
  "url": "http://localhost:3001/arxiv/mcp",
  "headers": {
    "API_TOKEN": "YOUR_SECRET_TOKEN"
  }
}
```


# Debug

## Setup Token

`.env.local`
```
API_TOKEN=YOUR_SECRET_TOKEN
```

## Setup MCP Config

```json
"your-server-name": {
  "url": "http://localhost:3000/arxiv/mcp",
  "headers": {
    "API_TOKEN": "YOUR_SECRET_TOKEN"
  }
}
```


```bash
# Run Server Option 1
npm run dev
# Run Server Option 2
vercel dev

# Inspector
npx @modelcontextprotocol/inspector@latest http://localhost:3000
```


