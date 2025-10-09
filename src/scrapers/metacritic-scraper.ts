import * as cheerio from 'cheerio'
import type { MetacriticGame, ScrapingOptions } from '../types/metacritic'

export class MetacriticScraper {
  private baseUrl = 'https://www.metacritic.com'
  private options: Required<ScrapingOptions>

  constructor(options: ScrapingOptions = {}) {
    this.options = {
      timeout: options.timeout ?? 10000,
      retries: options.retries ?? 3,
      delay: options.delay ?? 1000,
    }
  }

  private async fetchPage(url: string): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.options.retries; attempt++) {
      try {
        // Use fetch instead of axios since it works
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.text()
      } catch (error) {
        lastError = error as Error
        if (attempt < this.options.retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, this.options.delay))
        }
      }
    }

    throw new Error(
      `Failed to fetch ${url} after ${this.options.retries} attempts: ${lastError?.message}`
    )
  }

  async scrapeSearch(query: string): Promise<MetacriticGame[] | null> {
    try {
      // Encode the query for URL path and replace spaces with %20
      const encodedQuery = encodeURIComponent(query).replace(/%20/g, '%20')
      const url = `${this.baseUrl}/search/${encodedQuery}/`
      const html = await this.fetchPage(url)
      const $ = cheerio.load(html)

      // Find all search result items
      const searchResults = $('[data-testid="search-result-item"]')
      const games: MetacriticGame[] = []

      searchResults.each((_, element) => {
        const $item = $(element)

        // Extract title from product-title
        const title = $item.find('[data-testid="product-title"]').text().trim()

        // Extract score from metascore
        const scoreText = $item.find('[data-testid="product-metascore"] span').text().trim()
        const score = scoreText ? parseInt(scoreText, 10) : null

        // Extract URL
        const href = $item.attr('href')
        const gameUrl = href ? `${this.baseUrl}${href}` : ''

        if (title) {
          games.push({
            title,
            score,
            url: gameUrl,
          })
        }
      })

      return games
    } catch (error) {
      console.error('Error scraping search results:', error)
      return null
    }
  }

  async scrapeNewSwich2Release(): Promise<MetacriticGame[] | null> {
    try {
      const url = `${this.baseUrl}/browse/game/nintendo-switch/all/all-time/new/?platform=nintendo-switch-2`
      const html = await this.fetchPage(url)
      const $ = cheerio.load(html)

      // Find all game cards with data-testid="filter-results"
      const gameCards = $('[data-testid="filter-results"]')
      const games: MetacriticGame[] = []

      gameCards.each((_, element) => {
        const $card = $(element)

        // Extract game name from the title heading
        const title: string =
          $card.find('[data-title]').attr('data-title') ||
          $card.find('.c-finderProductCard_titleHeading span').text().trim()

        // Extract score from the metascore span
        const scoreText: string = $card.find('.c-siteReviewScore span').text().trim()
        const score: number | null = scoreText ? parseInt(scoreText, 10) : null

        // Extract release date from the meta section
        const releaseDateText: string = $card
          .find('.c-finderProductCard_meta span')
          .first()
          .text()
          .trim()
        const releaseDate: string | undefined = releaseDateText || undefined

        // Extract URL from the link
        const href: string | undefined = $card.find('a').attr('href')
        const gameUrl: string = href ? `${this.baseUrl}${href}` : ''

        if (title) {
          games.push({
            title,
            score,
            url: gameUrl,
            releaseDate,
          })
        }
      })

      return games
    } catch (error) {
      console.error('Error scraping new Switch 2 release:', error)
      return null
    }
  }

  async scrapeNewReleases(): Promise<MetacriticGame[] | null> {
    try {
      const url = `${this.baseUrl}/game`
      const html = await this.fetchPage(url)
      const $ = cheerio.load(html)

      // Find the carousel with data-testid="new-game-release-carousel"
      const carousel = $('[data-testid="new-game-release-carousel"]')

      if (carousel.length === 0) {
        console.warn('Carousel not found')
        return null
      }

      // Find all product cards within the carousel
      const productCards = carousel.find('[data-testid="product-card"]')

      if (productCards.length === 0) {
        console.warn('No product cards found in carousel')
        return null
      }

      // Extract game data from each product card
      const games: MetacriticGame[] = []

      productCards.each((_, element) => {
        const $card = $(element)

        // Extract title from h3 with class c-globalProductCard_title
        const title = $card.find('h3.c-globalProductCard_title').text().trim()

        // Extract score from span inside c-siteReviewScore
        const scoreText = $card.find('.c-siteReviewScore span').text().trim()
        const score = scoreText ? parseInt(scoreText, 10) : null

        // Extract link from a tag
        const link = $card.find('a').attr('href')
        const gameUrl = link ? `${this.baseUrl}${link}` : ''

        if (title) {
          games.push({
            title,
            score,
            url: gameUrl,
          })
        }
      })

      return games
    } catch (error) {
      console.error('Error scraping new releases:', error)
      return null
    }
  }

  async scrapeGame(gameUrl: string): Promise<MetacriticGame | null> {
    try {
      const html = await this.fetchPage(gameUrl)
      const $ = cheerio.load(html)

      const title = $('.product_title h1').text().trim()
      const scoreText = $('.metascore_w.large.game .metascore_anchor').text().trim()
      const score = scoreText ? parseInt(scoreText, 10) : null

      return {
        title,
        score,
        url: gameUrl,
      }
    } catch (error) {
      console.error(`Error scraping game ${gameUrl}:`, error)
      return null
    }
  }
}
