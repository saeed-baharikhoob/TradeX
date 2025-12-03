import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { calculatePnl, calculatePnlPercent } from '@/lib/utils/trading-calculations'

const selectPositions = (state: RootState) => state.trading.positions
const selectTicker = (state: RootState) => state.market.ticker

export const selectPositionsWithPnl = createSelector(
  [selectPositions, selectTicker],
  (positions, ticker) => {
    return positions.map(position => {
      const currentPrice = ticker?.symbol === position.symbol
        ? ticker.lastPrice
        : position.markPrice

      const unrealizedPnl = calculatePnl(
        position.side,
        position.entryPrice,
        currentPrice,
        position.size
      )
      const unrealizedPnlPercent = calculatePnlPercent(unrealizedPnl, position.margin)

      return {
        ...position,
        markPrice: currentPrice,
        unrealizedPnl,
        unrealizedPnlPercent
      }
    })
  }
)
