import { logger } from '@/lib/utils/logger'
import { APP_CONFIG } from '@/config/constants'

export interface LBankTicker {
  symbol: string
  ticker: {
    high: string
    vol: string
    low: string
    change: string
    turnover: string
    latest: string
    timestamp: number
  }
}

export interface LBankDepth {
  asks: [string, string][]
  bids: [string, string][]
  timestamp: number
}

export interface LBankKline {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export class LBankAPI {
  private baseUrl: string

  constructor(baseUrl: string = APP_CONFIG.LBANK_API_BASE) {
    this.baseUrl = baseUrl
  }

  async getTicker(symbol: string): Promise<LBankTicker> {
    const endpoint = `/ticker?symbol=${symbol.toLowerCase()}`
    logger.api.request(endpoint)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      const data = await response.json()

      if (data && data.data && data.data.length > 0) {
        logger.api.response(endpoint)
        return data.data[0]
      }

      throw new Error('Invalid ticker data')
    } catch (error) {
      logger.api.error(endpoint, error as Error)
      throw error
    }
  }

  async getDepth(symbol: string, size: number = APP_CONFIG.DEFAULT_ORDERBOOK_SIZE): Promise<LBankDepth> {
    const endpoint = `/depth?symbol=${symbol.toLowerCase()}&size=${size}`
    logger.api.request(endpoint)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      const data = await response.json()

      if (data && data.data) {
        logger.api.response(endpoint)
        return {
          asks: data.data.asks || [],
          bids: data.data.bids || [],
          timestamp: Date.now(),
        }
      }

      throw new Error('Invalid depth data')
    } catch (error) {
      logger.api.error(endpoint, error as Error)
      throw error
    }
  }

  async getKlines(
    symbol: string,
    interval: string,
    limit: number = APP_CONFIG.DEFAULT_KLINE_LIMIT
  ): Promise<LBankKline[]> {
    const lbankInterval = APP_CONFIG.KLINE_INTERVAL_MAP[interval as keyof typeof APP_CONFIG.KLINE_INTERVAL_MAP] || 'hour1'
    const endpoint = `/kline?symbol=${symbol.toLowerCase()}&size=${limit}&type=${lbankInterval}`
    logger.api.request(endpoint)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      const data = await response.json()

      if (data && data.data) {
        logger.api.response(endpoint)
        return data.data.map((k: any) => ({
          time: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        }))
      }

      return []
    } catch (error) {
      logger.api.error(endpoint, error as Error)
      return []
    }
  }

  async getAllTickers(): Promise<LBankTicker[]> {
    const endpoint = '/ticker?all=true'
    logger.api.request(endpoint)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      const data = await response.json()

      if (data && data.data) {
        logger.api.response(endpoint)
        return data.data
      }

      return []
    } catch (error) {
      logger.api.error(endpoint, error as Error)
      return []
    }
  }
}

let lbankApi: LBankAPI | null = null

export const getLBankAPI = (): LBankAPI => {
  if (!lbankApi) {
    lbankApi = new LBankAPI()
  }
  return lbankApi
}
