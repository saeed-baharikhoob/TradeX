import marketReducer, {
  setCurrentPair,
  setPairs,
  setTicker,
  updateTicker,
  toggleFavorite,
  setFavorites,
} from '../marketSlice'
import { TradingPair, Ticker } from '@/types/trading'

describe('marketSlice', () => {
  const initialState = {
    currentPair: null,
    pairs: [],
    ticker: null,
    favorites: [],
  }

  const mockPair: TradingPair = {
    symbol: 'BTCUSDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    displayName: 'BTC/USDT',
    lastPrice: 50000,
    priceChange24h: 1000,
    priceChangePercent24h: 2,
    high24h: 51000,
    low24h: 49000,
    volume24h: 1000,
    quoteVolume24h: 50000000,
  }

  const mockTicker: Ticker = {
    symbol: 'BTCUSDT',
    lastPrice: 50000,
    priceChange: 1000,
    priceChangePercent: 2,
    high: 51000,
    low: 49000,
    volume: 1000,
    quoteVolume: 50000000,
    openTime: Date.now() - 86400000,
    closeTime: Date.now(),
  }

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(marketReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })
  })

  describe('pairs', () => {
    it('should handle setCurrentPair', () => {
      const state = marketReducer(initialState, setCurrentPair(mockPair))
      expect(state.currentPair).toEqual(mockPair)
    })

    it('should handle setPairs', () => {
      const pairs = [mockPair]
      const state = marketReducer(initialState, setPairs(pairs))
      expect(state.pairs).toEqual(pairs)
    })

    it('should handle setPairs with multiple pairs', () => {
      const pair2 = { ...mockPair, symbol: 'ETHUSDT' }
      const pairs = [mockPair, pair2]
      const state = marketReducer(initialState, setPairs(pairs))
      expect(state.pairs).toHaveLength(2)
    })
  })

  describe('ticker', () => {
    it('should handle setTicker', () => {
      const state = marketReducer(initialState, setTicker(mockTicker))
      expect(state.ticker).toEqual(mockTicker)
    })

    it('should handle updateTicker when ticker exists', () => {
      const stateWithTicker = {
        ...initialState,
        ticker: mockTicker,
      }

      const updates = {
        lastPrice: 51000,
        priceChange: 2000,
      }

      const state = marketReducer(stateWithTicker, updateTicker(updates))
      expect(state.ticker?.lastPrice).toBe(51000)
      expect(state.ticker?.priceChange).toBe(2000)
      expect(state.ticker?.symbol).toBe('BTCUSDT') // Original data preserved
    })

    it('should handle updateTicker when ticker is null', () => {
      const updates: Partial<Ticker> = {
        symbol: 'BTCUSDT',
        lastPrice: 50000,
      }

      const state = marketReducer(initialState, updateTicker(updates))
      expect(state.ticker).toEqual(updates)
    })
  })

  describe('favorites', () => {
    it('should handle toggleFavorite - add favorite', () => {
      const state = marketReducer(initialState, toggleFavorite('BTCUSDT'))
      expect(state.favorites).toContain('BTCUSDT')
      expect(state.favorites).toHaveLength(1)
    })

    it('should handle toggleFavorite - remove favorite', () => {
      const stateWithFavorite = {
        ...initialState,
        favorites: ['BTCUSDT'],
      }

      const state = marketReducer(stateWithFavorite, toggleFavorite('BTCUSDT'))
      expect(state.favorites).not.toContain('BTCUSDT')
      expect(state.favorites).toHaveLength(0)
    })

    it('should handle toggleFavorite multiple times', () => {
      let state = marketReducer(initialState, toggleFavorite('BTCUSDT'))
      state = marketReducer(state, toggleFavorite('ETHUSDT'))
      state = marketReducer(state, toggleFavorite('BNBUSDT'))

      expect(state.favorites).toHaveLength(3)
      expect(state.favorites).toContain('BTCUSDT')
      expect(state.favorites).toContain('ETHUSDT')
      expect(state.favorites).toContain('BNBUSDT')

      state = marketReducer(state, toggleFavorite('ETHUSDT'))
      expect(state.favorites).toHaveLength(2)
      expect(state.favorites).not.toContain('ETHUSDT')
    })

    it('should handle setFavorites', () => {
      const favorites = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
      const state = marketReducer(initialState, setFavorites(favorites))
      expect(state.favorites).toEqual(favorites)
    })

    it('should handle setFavorites overwriting existing', () => {
      const stateWithFavorites = {
        ...initialState,
        favorites: ['BTCUSDT'],
      }

      const newFavorites = ['ETHUSDT', 'BNBUSDT']
      const state = marketReducer(stateWithFavorites, setFavorites(newFavorites))
      expect(state.favorites).toEqual(newFavorites)
      expect(state.favorites).not.toContain('BTCUSDT')
    })
  })

  describe('combined operations', () => {
    it('should handle setting pair and ticker together', () => {
      let state = marketReducer(initialState, setCurrentPair(mockPair))
      state = marketReducer(state, setTicker(mockTicker))

      expect(state.currentPair).toEqual(mockPair)
      expect(state.ticker).toEqual(mockTicker)
    })

    it('should maintain state independence', () => {
      let state = marketReducer(initialState, setCurrentPair(mockPair))
      state = marketReducer(state, toggleFavorite('BTCUSDT'))

      expect(state.currentPair).toEqual(mockPair)
      expect(state.favorites).toContain('BTCUSDT')


      state = marketReducer(state, toggleFavorite('BTCUSDT'))
      expect(state.currentPair).toEqual(mockPair)
      expect(state.favorites).toHaveLength(0)
    })
  })
})
