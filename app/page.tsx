import { JSX } from 'react'

export default function Home(): JSX.Element {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1>Szhshp's MCP Server</h1>
      <p>A Model Context Protocol (MCP) server providing news, gaming, and utility tools.</p>

      <h2>Available Tools</h2>

      <h3>News Tool</h3>
      <p>
        <strong>Endpoint:</strong> /news/mcp
      </p>
      <p>
        <strong>Tool:</strong> get_news
      </p>
      <p>
        Get news data from various platforms: bilibili, baidu, zhihu, tieba, sspai, ithome,
        thepaper, toutiao, weibo, 36kr, juejin, qq-news
      </p>

      <h3>Gaming Tool</h3>
      <p>
        <strong>Endpoint:</strong> /games/mcp
      </p>
      <p>
        <strong>Tool:</strong> game_tool
      </p>
      <p>Multi-purpose gaming tool with four functions:</p>
      <ul>
        <li>
          <strong>freeGame_epic:</strong> Get free Epic/Steam games
        </li>
        <li>
          <strong>newGame_metacritic:</strong> Fetch new game releases from Metacritic
        </li>
        <li>
          <strong>search_metacritic:</strong> Search for games on Metacritic
        </li>
        <li>
          <strong>newGame_switch2:</strong> Fetch new Nintendo Switch 2 game releases from
          Metacritic
        </li>
      </ul>

      <h3>Echo Tool</h3>
      <p>
        <strong>Endpoint:</strong> /mcp
      </p>
      <p>
        <strong>Tool:</strong> echo
      </p>
      <p>Simple echo tool for testing MCP connections.</p>
    </main>
  )
}
