import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js MCP Server',
  description: 'A Next.js project with MCP server capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
