import {
  calculatePnl,
  calculatePnlPercent,
  calculateLiquidationPrice,
} from '../trading-calculations'

describe('Trading Calculations', () => {
  describe('calculatePnl', () => {
    describe('for long positions', () => {
      it('should calculate positive PnL when price increases', () => {
        const pnl = calculatePnl('long', 50000, 55000, 0.1)
        expect(pnl).toBe(500)
      })

      it('should calculate negative PnL when price decreases', () => {
        const pnl = calculatePnl('long', 50000, 45000, 0.1)
        expect(pnl).toBe(-500)
      })

      it('should calculate zero PnL when price unchanged', () => {
        const pnl = calculatePnl('long', 50000, 50000, 0.1)
        expect(pnl).toBe(0)
      })
    })

    describe('for short positions', () => {
      it('should calculate positive PnL when price decreases', () => {
        const pnl = calculatePnl('short', 50000, 45000, 0.1)
        expect(pnl).toBe(500)
      })

      it('should calculate negative PnL when price increases', () => {
        const pnl = calculatePnl('short', 50000, 55000, 0.1)
        expect(pnl).toBe(-500)
      })

      it('should calculate zero PnL when price unchanged', () => {
        const pnl = calculatePnl('short', 50000, 50000, 0.1)
        expect(pnl).toBe(0)
      })
    })

    describe('with different position sizes', () => {
      it('should scale PnL with position size', () => {
        const pnl1 = calculatePnl('long', 50000, 51000, 1)
        const pnl2 = calculatePnl('long', 50000, 51000, 2)
        expect(pnl2).toBe(pnl1 * 2)
      })
    })
  })

  describe('calculatePnlPercent', () => {
    it('should calculate PnL percentage', () => {
      const percent = calculatePnlPercent(500, 5000)
      expect(percent).toBe(10)
    })

    it('should calculate negative PnL percentage', () => {
      const percent = calculatePnlPercent(-500, 5000)
      expect(percent).toBe(-10)
    })

    it('should return 0 when margin is 0', () => {
      const percent = calculatePnlPercent(500, 0)
      expect(percent).toBe(0)
    })

    it('should handle decimal percentages', () => {
      const percent = calculatePnlPercent(123.45, 1000)
      expect(percent).toBeCloseTo(12.345, 2)
    })
  })

  describe('calculateLiquidationPrice', () => {
    describe('for long positions', () => {
      it('should calculate liquidation price with 10x leverage', () => {
        const liqPrice = calculateLiquidationPrice('long', 50000, 10)
        expect(liqPrice).toBe(45500)
      })

      it('should calculate liquidation price with 5x leverage', () => {
        const liqPrice = calculateLiquidationPrice('long', 50000, 5)
        expect(liqPrice).toBe(41000)
      })

      it('should calculate liquidation price with 100x leverage', () => {
        const liqPrice = calculateLiquidationPrice('long', 50000, 100)
        expect(liqPrice).toBe(49550)
      })
    })

    describe('for short positions', () => {
      it('should calculate liquidation price with 10x leverage', () => {
        const liqPrice = calculateLiquidationPrice('short', 50000, 10)
        expect(liqPrice).toBeCloseTo(54500, 1)
      })

      it('should calculate liquidation price with 5x leverage', () => {
        const liqPrice = calculateLiquidationPrice('short', 50000, 5)
        expect(liqPrice).toBeCloseTo(59000, 1)
      })

      it('should calculate liquidation price with 100x leverage', () => {
        const liqPrice = calculateLiquidationPrice('short', 50000, 100)
        expect(liqPrice).toBeCloseTo(50450, 1)
      })
    })

    describe('with custom maintenance margin factor', () => {
      it('should use custom factor for long position', () => {
        const liqPrice = calculateLiquidationPrice('long', 50000, 10, 0.8)
        expect(liqPrice).toBe(46000)
      })

      it('should use custom factor for short position', () => {
        const liqPrice = calculateLiquidationPrice('short', 50000, 10, 0.8)
        expect(liqPrice).toBe(54000)
      })
    })
  })
})
