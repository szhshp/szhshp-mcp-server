export interface MetacriticGame {
  title: string
  score: number | null
  url: string
}

export type MetacriticContent = MetacriticGame

export interface ScrapingOptions {
  timeout?: number
  retries?: number
  delay?: number
}
