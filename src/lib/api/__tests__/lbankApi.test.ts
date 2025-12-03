import { LBankAPI } from '../lbankApi'
import { APP_CONFIG } from '@/config/constants'


global.fetch = jest.fn()

describe('LBankAPI', () => {
  let api: LBankAPI
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    api = new LBankAPI()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getTicker', () => {
    it('should fetch and return ticker data', async () => {
      const mockResponse = {
        data: [
          {
            symbol: 'btc_usdt',
            ticker: {
              high: '52000',
              vol: '1000',
              low: '48000',
              change: '1000',
              turnover: '50000000',
              latest: '50000',
              timestamp: Date.now(),
            },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response)

      const result = await api.getTicker('btc_usdt')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/lbank/ticker?symbol=btc_usdt')
      )
      expect(result).toEqual(mockResponse.data[0])
    })

    it('should throw error when response is invalid', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ data: [] }),
      } as Response)

      await expect(api.getTicker('btc_usdt')).rejects.toThrow('Invalid ticker data')
    })

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.getTicker('btc_usdt')).rejects.toThrow('Network error')
    })
  })

  describe('getDepth', () => {
    it('should fetch and return orderbook depth', async () => {
      const mockResponse = {
        data: {
          asks: [
            ['50100', '0.5'],
            ['50200', '1.0'],
          ],
          bids: [
            ['49900', '0.5'],
            ['49800', '1.0'],
          ],
        },
      }

      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response)

      const result = await api.getDepth('btc_usdt')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/lbank/depth?symbol=btc_usdt&size=${APP_CONFIG.DEFAULT_ORDERBOOK_SIZE}`)
      )
      expect(result.asks).toEqual(mockResponse.data.asks)
      expect(result.bids).toEqual(mockResponse.data.bids)
      expect(result.timestamp).toBeDefined()
    })

    it('should use custom size parameter', async () => {
      const mockResponse = { data: { asks: [], bids: [] } }

      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response)

      await api.getDepth('btc_usdt', 100)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('size=100')
      )
    })

    it('should throw error when response is invalid', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({}),
      } as Response)

      await expect(api.getDepth('btc_usdt')).rejects.toThrow('Invalid depth data')
    })
  })

  describe('getKlines', () => {
    it('should fetch and return kline data', async () => {
      const mockResponse = {
        data: [
          [Date.now(), '50000', '51000', '49000', '50500', '100'],
          [Date.now(), '50500', '51500', '50000', '51000', '150'],
        ],
      }

      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response)

      const result = await api.getKlines('btc_usdt', '1h')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=hour1')
      )
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('time')
      expect(result[0]).toHaveProperty('open')
      expect(result[0]).toHaveProperty('high')
      expect(result[0]).toHaveProperty('low')
      expect(result[0]).toHaveProperty('close')
      expect(result[0]).toHaveProperty('volume')
    })

    it('should map intervals correctly', async () => {
      const mockResponse = { data: [] }

      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response)

      await api.getKlines('btc_usdt', '15m')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=minute15')
      )
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getKlines('btc_usdt', '1h')

      expect(result).toEqual([])
    })

    it('should use default interval when invalid', async () => {
      const mockResponse = { data: [] }

      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response)

      await api.getKlines('btc_usdt', 'invalid')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=hour1')
      )
    })
  })

  describe('getAllTickers', () => {
    it('should fetch and return all tickers', async () => {
      const mockResponse = {
        data: [
          {
            symbol: 'btc_usdt',
            ticker: { latest: '50000' },
          },
          {
            symbol: 'eth_usdt',
            ticker: { latest: '3000' },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      } as Response)

      const result = await api.getAllTickers()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/lbank/ticker?all=true')
      )
      expect(result).toHaveLength(2)
    })

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getAllTickers()

      expect(result).toEqual([])
    })

    it('should return empty array when data is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({}),
      } as Response)

      const result = await api.getAllTickers()

      expect(result).toEqual([])
    })
  })

  describe('singleton instance', () => {
    it('should use default base URL', () => {
      const api = new LBankAPI()
      expect((api as any).baseUrl).toBe(APP_CONFIG.LBANK_API_BASE)
    })

    it('should accept custom base URL', () => {
      const customUrl = '/custom/api'
      const api = new LBankAPI(customUrl)
      expect((api as any).baseUrl).toBe(customUrl)
    })
  })
})
