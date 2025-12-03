import {
  formatNumber,
  formatPrice,
  formatVolume,
  formatMarketCap,
  formatPercentage,
  toLBankSymbol,
  fromLBankSymbol,
  formatNumberInput,
  parseNumberInput,
  isValidNumberInput,
  validateTpSl,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatNumber', () => {
    it('should format number with default decimals', () => {
      expect(formatNumber(1234.5678)).toBe('1,234.57')
    })

    it('should format number with custom decimals', () => {
      expect(formatNumber(1234.5678, 4)).toBe('1,234.5678')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0.00')
    })
  })

  describe('formatPrice', () => {
    it('should format large prices with 2 decimals', () => {
      expect(formatPrice(50000)).toBe('50,000.00')
    })

    it('should format medium prices with 4 decimals', () => {
      expect(formatPrice(100)).toBe('100.0000')
    })

    it('should format small prices with 6 decimals', () => {
      expect(formatPrice(0.0005)).toBe('0.000500')
    })
  })

  describe('formatVolume', () => {
    it('should format billions', () => {
      expect(formatVolume(1500000000)).toBe('1.500B')
    })

    it('should format millions', () => {
      expect(formatVolume(2500000)).toBe('2.50M')
    })

    it('should format thousands', () => {
      expect(formatVolume(5500)).toBe('5.50K')
    })

    it('should format small numbers', () => {
      expect(formatVolume(500)).toBe('500.00')
    })
  })

  describe('formatMarketCap', () => {
    it('should format trillions with $ sign', () => {
      expect(formatMarketCap(1500000000000)).toBe('$1.500T')
    })

    it('should format billions with $ sign', () => {
      expect(formatMarketCap(2500000000)).toBe('$2.500B')
    })

    it('should format millions with $ sign', () => {
      expect(formatMarketCap(5500000)).toBe('$5.50M')
    })
  })

  describe('formatPercentage', () => {
    it('should format positive percentage with + sign', () => {
      expect(formatPercentage(5.25)).toBe('+5.25%')
    })

    it('should format negative percentage with - sign', () => {
      expect(formatPercentage(-3.75)).toBe('-3.75%')
    })

    it('should format zero', () => {
      expect(formatPercentage(0)).toBe('+0.00%')
    })
  })

  describe('toLBankSymbol', () => {
    it('should convert BTCUSDT to btc_usdt', () => {
      expect(toLBankSymbol('BTCUSDT')).toBe('btc_usdt')
    })

    it('should convert ETHUSDC to eth_usdc', () => {
      expect(toLBankSymbol('ETHUSDC')).toBe('eth_usdc')
    })

    it('should handle lowercase symbols', () => {
      expect(toLBankSymbol('btcusdt')).toBe('btc_usdt')
    })
  })

  describe('fromLBankSymbol', () => {
    it('should convert btc_usdt to BTCUSDT', () => {
      expect(fromLBankSymbol('btc_usdt')).toBe('BTCUSDT')
    })

    it('should convert eth_usdc to ETHUSDC', () => {
      expect(fromLBankSymbol('eth_usdc')).toBe('ETHUSDC')
    })
  })

  describe('formatNumberInput', () => {
    it('should add commas to thousands', () => {
      expect(formatNumberInput('1234567')).toBe('1,234,567')
    })

    it('should preserve decimals', () => {
      expect(formatNumberInput('1234.56')).toBe('1,234.56')
    })

    it('should remove invalid characters', () => {
      expect(formatNumberInput('123abc456')).toBe('123,456')
    })

    it('should handle multiple decimal points', () => {
      expect(formatNumberInput('123.45.67')).toBe('123.4567')
    })
  })

  describe('parseNumberInput', () => {
    it('should parse formatted number', () => {
      expect(parseNumberInput('1,234.56')).toBe(1234.56)
    })

    it('should handle plain numbers', () => {
      expect(parseNumberInput('1234.56')).toBe(1234.56)
    })

    it('should return 0 for invalid input', () => {
      expect(parseNumberInput('abc')).toBe(0)
    })

    it('should return 0 for empty string', () => {
      expect(parseNumberInput('')).toBe(0)
    })
  })

  describe('isValidNumberInput', () => {
    it('should accept valid numbers', () => {
      expect(isValidNumberInput('123.456')).toBe(true)
    })

    it('should accept numbers with commas', () => {
      expect(isValidNumberInput('1,234.56')).toBe(true)
    })

    it('should reject letters', () => {
      expect(isValidNumberInput('123abc')).toBe(false)
    })

    it('should accept empty string', () => {
      expect(isValidNumberInput('')).toBe(true)
    })
  })

  describe('validateTpSl', () => {
    describe('for long positions (buy)', () => {
      it('should reject TP below entry price', () => {
        const result = validateTpSl({
          orderType: 'buy',
          entryPrice: 50000,
          marketPrice: 50000,
          takeProfitPrice: 49000,
          stopLossPrice: null,
        })
        expect(result).toContain('higher than entry price')
      })

      it('should reject SL above entry price', () => {
        const result = validateTpSl({
          orderType: 'buy',
          entryPrice: 50000,
          marketPrice: 50000,
          takeProfitPrice: null,
          stopLossPrice: 51000,
        })
        expect(result).toContain('lower than entry price')
      })

      it('should accept valid TP and SL', () => {
        const result = validateTpSl({
          orderType: 'buy',
          entryPrice: 50000,
          marketPrice: 50000,
          takeProfitPrice: 55000,
          stopLossPrice: 48000,
        })
        expect(result).toBeNull()
      })
    })

    describe('for short positions (sell)', () => {
      it('should reject TP above entry price', () => {
        const result = validateTpSl({
          orderType: 'sell',
          entryPrice: 50000,
          marketPrice: 50000,
          takeProfitPrice: 51000,
          stopLossPrice: null,
        })
        expect(result).toContain('lower than entry price')
      })

      it('should reject SL below entry price', () => {
        const result = validateTpSl({
          orderType: 'sell',
          entryPrice: 50000,
          marketPrice: 50000,
          takeProfitPrice: null,
          stopLossPrice: 49000,
        })
        expect(result).toContain('higher than entry price')
      })

      it('should accept valid TP and SL', () => {
        const result = validateTpSl({
          orderType: 'sell',
          entryPrice: 50000,
          marketPrice: 50000,
          takeProfitPrice: 48000,
          stopLossPrice: 52000,
        })
        expect(result).toBeNull()
      })
    })

    describe('deviation limits', () => {
      it('should reject TP too far from market price', () => {
        const result = validateTpSl({
          orderType: 'buy',
          entryPrice: 50000,
          marketPrice: 50000,
          takeProfitPrice: 100000,
          stopLossPrice: null,
        })
        expect(result).toContain('too far from market price')
      })

      it('should reject SL too far from market price', () => {
        const result = validateTpSl({
          orderType: 'buy',
          entryPrice: 50000,
          marketPrice: 50000,
          takeProfitPrice: null,
          stopLossPrice: 10000,
        })
        expect(result).toContain('too far from market price')
      })
    })
  })
})
