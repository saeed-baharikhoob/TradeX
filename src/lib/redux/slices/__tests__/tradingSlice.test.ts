import tradingReducer, {
  setPositions,
  addPosition,
  updatePosition,
  removePosition,
  setOrders,
  removeOrder,
  setLeverage,
  setOrderType,
  setAvailableBalance,
  setSelectedPrice,
} from '../tradingSlice'
import { Position, Order } from '@/types/trading'

describe('tradingSlice', () => {
  const initialState = {
    positions: [],
    orders: [],
    leverage: 10,
    orderType: 'limit' as const,
    availableBalance: 0,
    selectedPrice: null,
  }

  const mockPosition: Position = {
    id: '1',
    symbol: 'BTCUSDT',
    side: 'long',
    size: 0.1,
    entryPrice: 50000,
    markPrice: 51000,
    liquidationPrice: 45500,
    margin: 5000,
    leverage: 10,
    unrealizedPnl: 100,
    unrealizedPnlPercent: 2,
  }

  const mockOrder: Order = {
    id: '1',
    symbol: 'BTCUSDT',
    type: 'limit',
    side: 'buy',
    price: 50000,
    quantity: 0.1,
    filled: 0,
    status: 'open',
    timestamp: Date.now(),
  }

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(tradingReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })
  })

  describe('positions', () => {
    it('should handle setPositions', () => {
      const positions = [mockPosition]
      const state = tradingReducer(initialState, setPositions(positions))
      expect(state.positions).toEqual(positions)
    })

    it('should handle addPosition', () => {
      const state = tradingReducer(initialState, addPosition(mockPosition))
      expect(state.positions).toHaveLength(1)
      expect(state.positions[0]).toEqual(mockPosition)
    })

    it('should handle updatePosition', () => {
      const stateWithPosition = {
        ...initialState,
        positions: [mockPosition],
      }

      const updates = {
        markPrice: 52000,
        unrealizedPnl: 200,
      }

      const state = tradingReducer(
        stateWithPosition,
        updatePosition({ id: '1', updates })
      )

      expect(state.positions[0].markPrice).toBe(52000)
      expect(state.positions[0].unrealizedPnl).toBe(200)
    })

    it('should not update if position not found', () => {
      const state = tradingReducer(
        initialState,
        updatePosition({ id: '999', updates: { markPrice: 52000 } })
      )
      expect(state.positions).toEqual([])
    })

    it('should handle removePosition', () => {
      const stateWithPosition = {
        ...initialState,
        positions: [mockPosition],
      }

      const state = tradingReducer(stateWithPosition, removePosition('1'))
      expect(state.positions).toHaveLength(0)
    })

    it('should not remove if position not found', () => {
      const stateWithPosition = {
        ...initialState,
        positions: [mockPosition],
      }

      const state = tradingReducer(stateWithPosition, removePosition('999'))
      expect(state.positions).toHaveLength(1)
    })
  })

  describe('orders', () => {
    it('should handle setOrders', () => {
      const orders = [mockOrder]
      const state = tradingReducer(initialState, setOrders(orders))
      expect(state.orders).toEqual(orders)
    })

    it('should handle removeOrder', () => {
      const stateWithOrder = {
        ...initialState,
        orders: [mockOrder],
      }

      const state = tradingReducer(stateWithOrder, removeOrder('1'))
      expect(state.orders).toHaveLength(0)
    })

    it('should not remove if order not found', () => {
      const stateWithOrder = {
        ...initialState,
        orders: [mockOrder],
      }

      const state = tradingReducer(stateWithOrder, removeOrder('999'))
      expect(state.orders).toHaveLength(1)
    })
  })

  describe('trading parameters', () => {
    it('should handle setLeverage', () => {
      const state = tradingReducer(initialState, setLeverage(20))
      expect(state.leverage).toBe(20)
    })

    it('should handle setOrderType', () => {
      const state = tradingReducer(initialState, setOrderType('market'))
      expect(state.orderType).toBe('market')
    })

    it('should handle setAvailableBalance', () => {
      const state = tradingReducer(initialState, setAvailableBalance(10000))
      expect(state.availableBalance).toBe(10000)
    })

    it('should handle setSelectedPrice', () => {
      const state = tradingReducer(initialState, setSelectedPrice(50000))
      expect(state.selectedPrice).toBe(50000)
    })

    it('should handle setSelectedPrice with null', () => {
      const stateWithPrice = {
        ...initialState,
        selectedPrice: 50000,
      }

      const state = tradingReducer(stateWithPrice, setSelectedPrice(null))
      expect(state.selectedPrice).toBeNull()
    })
  })

  describe('multiple actions', () => {
    it('should handle multiple position operations', () => {
      let state = tradingReducer(initialState, addPosition(mockPosition))

      const position2 = { ...mockPosition, id: '2', symbol: 'ETHUSDT' }
      state = tradingReducer(state, addPosition(position2))

      expect(state.positions).toHaveLength(2)

      state = tradingReducer(state, removePosition('1'))
      expect(state.positions).toHaveLength(1)
      expect(state.positions[0].id).toBe('2')
    })
  })
})
