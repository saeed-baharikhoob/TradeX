'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { removePosition, updatePosition, removeOrder, addPosition } from '@/lib/redux/slices/tradingSlice'
import { selectPositionsWithPnl } from '@/lib/redux/selectors'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { formatPrice, formatNumber, validateTpSl, parseNumberInput } from '@/lib/utils'
import { calculateLiquidationPrice } from '@/lib/utils/trading-calculations'
import { Position, TpSlPriceType } from '@/types/trading'
import toast from 'react-hot-toast'
import { PositionRow } from './PositionRow'
import { OrderRow } from './OrderRow'

export const PositionsTable = () => {
  const dispatch = useAppDispatch()
  const { orders } = useAppSelector((state) => state.trading)
  const { currentPair, ticker } = useAppSelector((state) => state.market)
  const positionsWithPnl = useAppSelector(selectPositionsWithPnl)
  const [hideOtherPairs, setHideOtherPairs] = useState(false)
  const [tpslDialogOpen, setTpslDialogOpen] = useState(false)
  const [reverseConfirmOpen, setReverseConfirmOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [takeProfitPrice, setTakeProfitPrice] = useState('')
  const [stopLossPrice, setStopLossPrice] = useState('')
  const [tpPriceType, setTpPriceType] = useState<TpSlPriceType>('Last')
  const [slPriceType, setSlPriceType] = useState<TpSlPriceType>('Last')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredPositions = hideOtherPairs && currentPair
    ? positionsWithPnl.filter(pos => pos.symbol === currentPair.symbol)
    : positionsWithPnl


  const handleCancelAllOrders = useCallback(() => {
    orders.forEach(order => {
      dispatch(removeOrder(order.id))
    })
    toast.success(`Cancelled ${orders.length} order(s)`)
  }, [orders, dispatch])

  const handleCancelOrder = useCallback((orderId: string) => {
    dispatch(removeOrder(orderId))
    toast.success('Order cancelled successfully')
  }, [dispatch])

  const handleClosePosition = useCallback((position: Position) => {
    dispatch(removePosition(position.id))
    toast.success('Position closed successfully')
  }, [dispatch])

  const handleOpenReverseConfirm = useCallback((position: Position) => {
    setSelectedPosition(position)
    setReverseConfirmOpen(true)
  }, [])

  const handleConfirmReverse = () => {
    if (!selectedPosition) return

    const currentMarketPrice = selectedPosition.markPrice

    const newSide = selectedPosition.side === 'long' ? 'short' : 'long'
    const newEntryPrice = currentMarketPrice
    const leverage = selectedPosition.leverage

    const newLiquidationPrice = calculateLiquidationPrice(newSide, newEntryPrice, leverage)

    dispatch(removePosition(selectedPosition.id))

    const newPosition: Position = {
      ...selectedPosition,
      id: `${selectedPosition.symbol}-${Date.now()}`,
      side: newSide,
      entryPrice: newEntryPrice,
      markPrice: currentMarketPrice,
      liquidationPrice: newLiquidationPrice,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      takeProfitPrice: undefined,
      stopLossPrice: undefined,
    }

    dispatch(addPosition(newPosition))
    toast.success(`Position reversed to ${newPosition.side.toUpperCase()}`)
    setReverseConfirmOpen(false)
    setSelectedPosition(null)
  }

  const handleOpenTpSlDialog = useCallback((position: Position) => {
    setSelectedPosition(position)
    setTakeProfitPrice(position.takeProfitPrice?.toString() || '')
    setStopLossPrice(position.stopLossPrice?.toString() || '')
    setTpPriceType(position.tpPriceType || 'Last')
    setSlPriceType(position.slPriceType || 'Last')
    setTpslDialogOpen(true)
  }, [])

  const handleSaveTpSl = () => {
    if (!selectedPosition) return

    const tpPrice = takeProfitPrice ? parseNumberInput(takeProfitPrice) : null
    const slPrice = stopLossPrice ? parseNumberInput(stopLossPrice) : null


    if (tpPrice || slPrice) {
      const validationError = validateTpSl({
        orderType: selectedPosition.side === 'long' ? 'buy' : 'sell',
        entryPrice: selectedPosition.entryPrice,
        marketPrice: selectedPosition.markPrice,
        takeProfitPrice: tpPrice,
        stopLossPrice: slPrice,
      })

      if (validationError) {
        toast.error(validationError)
        return
      }
    }

    const updates: Partial<Position> = {
      takeProfitPrice: tpPrice || undefined,
      stopLossPrice: slPrice || undefined,
      tpPriceType,
      slPriceType,
    }

    dispatch(updatePosition({ id: selectedPosition.id, updates }))
    toast.success('TP/SL updated successfully')
    setTpslDialogOpen(false)
    setSelectedPosition(null)
  }

  return (
    <div className="bg-background border-t border h-full flex flex-col">
      <Tabs defaultValue="positions" className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between border-b border px-4 flex-shrink-0">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger
              value="positions"
              className="px-4 py-3 text-sm data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none"
            >
              Positions({positionsWithPnl.length})
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="px-4 py-3 text-sm data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none"
            >
              Orders({orders.length})
            </TabsTrigger>
            <TabsTrigger
              value="balances"
              className="px-4 py-3 text-sm data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none"
            >
              Balances
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-4 py-3 text-sm data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none"
            >
              History
            </TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="sm"
            className="text-trading-red hover:text-trading-red/80 hover:bg-transparent"
            onClick={handleCancelAllOrders}
            disabled={orders.length === 0}
          >
            Cancel all
          </Button>
        </div>


        <TabsContent value="positions" className="mt-0 flex-1 overflow-hidden flex flex-col">
          <div className="px-4 pt-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <Switch
                id="hideOtherPairs"
                checked={hideOtherPairs}
                onCheckedChange={setHideOtherPairs}
              />
              <label htmlFor="hideOtherPairs" className="text-sm text-muted-foreground cursor-pointer">
                Hide other pairs
              </label>
            </div>
          </div>
          {filteredPositions.length > 0 ? (
              <div className="overflow-x-auto overflow-y-auto flex-1 px-4 pb-4 custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b border">
                    <tr>
                      <th className="text-left py-2 px-2 md:py-3 md:px-4 font-normal text-xs md:text-sm">Pair</th>
                      <th className="text-left py-2 px-2 md:py-3 md:px-4 font-normal text-xs md:text-sm">Size</th>
                      <th className="text-left py-2 px-2 md:py-3 md:px-4 font-normal text-xs md:text-sm hidden sm:table-cell">Entry</th>
                      <th className="text-left py-2 px-2 md:py-3 md:px-4 font-normal text-xs md:text-sm">Mark</th>
                      <th className="text-left py-2 px-2 md:py-3 md:px-4 font-normal text-xs md:text-sm hidden lg:table-cell">Liq.</th>
                      <th className="text-left py-2 px-2 md:py-3 md:px-4 font-normal text-xs md:text-sm">PNL</th>
                      <th className="text-left py-2 px-2 md:py-3 md:px-4 font-normal text-xs md:text-sm hidden md:table-cell">TP/SL</th>
                      <th className="text-right py-2 px-2 md:py-3 md:px-4 font-normal text-xs md:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {filteredPositions.map((position, idx) => (
                      <PositionRow
                        key={idx}
                        position={position}
                        onClose={handleClosePosition}
                        onReverse={handleOpenReverseConfirm}
                        onEditTpSl={handleOpenTpSlDialog}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground flex-1 flex items-center justify-center">
              No open positions
            </div>
          )}
        </TabsContent>


        <TabsContent value="orders" className="mt-0 flex-1 overflow-hidden flex flex-col">
          {orders.length > 0 ? (
              <div className="overflow-x-auto overflow-y-auto flex-1 p-4 custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b border">
                    <tr>
                      <th className="text-left py-3 font-normal">Time</th>
                      <th className="text-left py-3 font-normal">Pair</th>
                      <th className="text-left py-3 font-normal">Type</th>
                      <th className="text-right py-3 font-normal">Side</th>
                      <th className="text-right py-3 font-normal">Price</th>
                      <th className="text-right py-3 font-normal">Amount</th>
                      <th className="text-right py-3 font-normal">Filled</th>
                      <th className="text-right py-3 font-normal">Status</th>
                      <th className="text-right py-3 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {orders.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onCancel={handleCancelOrder}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground flex-1 flex items-center justify-center">
              No open orders
            </div>
          )}
        </TabsContent>

        <TabsContent value="balances" className="mt-0 flex-1 overflow-hidden">
          <div className="p-4 text-center py-12 text-muted-foreground">
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex-1 overflow-hidden">
          <div className="p-4 text-center py-12 text-muted-foreground">
          </div>
        </TabsContent>
      </Tabs>


      {isMobile ? (
        <BottomSheet
          isOpen={tpslDialogOpen}
          onClose={() => setTpslDialogOpen(false)}
          title="Set Take Profit / Stop Loss"
        >
          {selectedPosition && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-muted-foreground text-sm">Position:</span>
              <span className="text-white font-semibold text-base">{selectedPosition.symbol}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                selectedPosition.side === 'long'
                  ? 'bg-trading-green/20 text-trading-green'
                  : 'bg-trading-red/20 text-trading-red'
              }`}>
                {selectedPosition.side.toUpperCase()} {selectedPosition.leverage}x
              </span>
            </div>
          )}

          <div className="space-y-4">
            {selectedPosition && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-background-elevated rounded-lg border border-border">
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Entry Price</div>
                  <div className="text-white font-semibold text-xs">{formatPrice(selectedPosition.entryPrice)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Mark Price</div>
                  <div className="text-white font-semibold text-xs">{formatPrice(selectedPosition.markPrice)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Size</div>
                  <div className="text-white font-semibold text-xs">{formatNumber(selectedPosition.size, 4)}</div>
                </div>
              </div>
            )}

            <div className="space-y-3 p-3 bg-background-elevated/50 rounded-lg border border-trading-green/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-trading-green flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-trading-green"></span>
                  Take Profit
                </label>
                <Select value={tpPriceType} onValueChange={(value: TpSlPriceType) => setTpPriceType(value)}>
                  <SelectTrigger className="w-16 h-6 bg-background border border-trading-green/30 text-white text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background-card border text-white">
                    <SelectItem value="Last">Last</SelectItem>
                    <SelectItem value="Mark">Mark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="number"
                placeholder="Enter take profit price"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                className="bg-background border-trading-green/30 text-white h-11 text-base focus:border-trading-green"
              />

              {selectedPosition && (
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 5, 10].map((percent) => {
                    const price = selectedPosition.side === 'long'
                      ? selectedPosition.entryPrice * (1 + percent / 100)
                      : selectedPosition.entryPrice * (1 - percent / 100)
                    return (
                      <button
                        key={`tp-${percent}`}
                        onClick={() => setTakeProfitPrice(price.toFixed(2))}
                        className="px-2.5 py-1.5 text-xs bg-trading-green/10 active:bg-trading-green/20 text-trading-green rounded border border-trading-green/30"
                      >
                        +{percent}%
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setTakeProfitPrice('')}
                    className="px-2.5 py-1.5 text-xs bg-background active:bg-background-elevated text-muted-foreground rounded border border-border"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 p-3 bg-background-elevated/50 rounded-lg border border-trading-red/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-trading-red flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-trading-red"></span>
                  Stop Loss
                </label>
                <Select value={slPriceType} onValueChange={(value: TpSlPriceType) => setSlPriceType(value)}>
                  <SelectTrigger className="w-16 h-6 bg-background border border-trading-red/30 text-white text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background-card border text-white">
                    <SelectItem value="Last">Last</SelectItem>
                    <SelectItem value="Mark">Mark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="number"
                placeholder="Enter stop loss price"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                className="bg-background border-trading-red/30 text-white h-11 text-base focus:border-trading-red"
              />

              {selectedPosition && (
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 5, 10].map((percent) => {
                    const price = selectedPosition.side === 'long'
                      ? selectedPosition.entryPrice * (1 - percent / 100)
                      : selectedPosition.entryPrice * (1 + percent / 100)
                    return (
                      <button
                        key={`sl-${percent}`}
                        onClick={() => setStopLossPrice(price.toFixed(2))}
                        className="px-2.5 py-1.5 text-xs bg-trading-red/10 active:bg-trading-red/20 text-trading-red rounded border border-trading-red/30"
                      >
                        -{percent}%
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setStopLossPrice('')}
                    className="px-2.5 py-1.5 text-xs bg-background active:bg-background-elevated text-muted-foreground rounded border border-border"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setTpslDialogOpen(false)}
              className="flex-1 bg-transparent border border-border text-white hover:bg-background-elevated"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTpSl}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
            >
              Confirm
            </Button>
          </div>
        </BottomSheet>
      ) : (
        <Dialog open={tpslDialogOpen} onOpenChange={setTpslDialogOpen}>
          <DialogContent className="bg-background-card border text-white max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Set Take Profit / Stop Loss</DialogTitle>
              {selectedPosition && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="text-white font-semibold text-lg">{selectedPosition.symbol}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedPosition.side === 'long'
                      ? 'bg-trading-green/20 text-trading-green'
                      : 'bg-trading-red/20 text-trading-red'
                  }`}>
                    {selectedPosition.side.toUpperCase()} {selectedPosition.leverage}x
                  </span>
                </div>
              )}
            </DialogHeader>

            <div className="space-y-6 py-4">
              {selectedPosition && (
                <div className="grid grid-cols-3 gap-3 p-4 bg-background-elevated rounded-lg border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
                    <div className="text-white font-semibold">{formatPrice(selectedPosition.entryPrice)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Mark Price</div>
                    <div className="text-white font-semibold">{formatPrice(selectedPosition.markPrice)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Size</div>
                    <div className="text-white font-semibold">{formatNumber(selectedPosition.size, 4)}</div>
                  </div>
                </div>
              )}

              <div className="space-y-4 p-4 bg-background-elevated/50 rounded-lg border border-trading-green/20">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-trading-green flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-trading-green"></span>
                    Take Profit
                  </label>
                  <Select value={tpPriceType} onValueChange={(value: TpSlPriceType) => setTpPriceType(value)}>
                    <SelectTrigger className="w-20 h-7 bg-background border border-trading-green/30 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background-card border text-white">
                      <SelectItem value="Last">Last</SelectItem>
                      <SelectItem value="Mark">Mark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  type="number"
                  placeholder="Enter take profit price"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  className="bg-background border-trading-green/30 text-white h-12 text-lg focus:border-trading-green"
                />

                {selectedPosition && (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 5, 10].map((percent) => {
                      const price = selectedPosition.side === 'long'
                        ? selectedPosition.entryPrice * (1 + percent / 100)
                        : selectedPosition.entryPrice * (1 - percent / 100)
                      return (
                        <button
                          key={`tp-${percent}`}
                          onClick={() => setTakeProfitPrice(price.toFixed(2))}
                          className="px-3 py-1.5 text-xs bg-trading-green/10 hover:bg-trading-green/20 text-trading-green rounded border border-trading-green/30 transition-colors"
                        >
                          +{percent}%
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setTakeProfitPrice('')}
                      className="px-3 py-1.5 text-xs bg-background hover:bg-background-elevated text-muted-foreground rounded border border-border transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 bg-background-elevated/50 rounded-lg border border-trading-red/20">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-trading-red flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-trading-red"></span>
                    Stop Loss
                  </label>
                  <Select value={slPriceType} onValueChange={(value: TpSlPriceType) => setSlPriceType(value)}>
                    <SelectTrigger className="w-20 h-7 bg-background border border-trading-red/30 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background-card border text-white">
                      <SelectItem value="Last">Last</SelectItem>
                      <SelectItem value="Mark">Mark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  type="number"
                  placeholder="Enter stop loss price"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className="bg-background border-trading-red/30 text-white h-12 text-lg focus:border-trading-red"
                />

                {selectedPosition && (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 5, 10].map((percent) => {
                      const price = selectedPosition.side === 'long'
                        ? selectedPosition.entryPrice * (1 - percent / 100)
                        : selectedPosition.entryPrice * (1 + percent / 100)
                      return (
                        <button
                          key={`sl-${percent}`}
                          onClick={() => setStopLossPrice(price.toFixed(2))}
                          className="px-3 py-1.5 text-xs bg-trading-red/10 hover:bg-trading-red/20 text-trading-red rounded border border-trading-red/30 transition-colors"
                        >
                          -{percent}%
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setStopLossPrice('')}
                      className="px-3 py-1.5 text-xs bg-background hover:bg-background-elevated text-muted-foreground rounded border border-border transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setTpslDialogOpen(false)}
                className="flex-1 bg-transparent border border-border text-white hover:bg-background-elevated"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTpSl}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


      <Dialog open={reverseConfirmOpen} onOpenChange={setReverseConfirmOpen}>
        <DialogContent className="bg-background-card border text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Reverse Position</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedPosition && (
              <div className="space-y-4">
                <p className="text-foreground/80">
                  Are you sure you want to reverse this position?
                </p>
                <div className="bg-background-card p-4 rounded border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="text-white font-semibold">{selectedPosition.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Side:</span>
                    <span className={selectedPosition.side === 'long' ? 'text-trading-green' : 'text-trading-red'}>
                      {selectedPosition.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">New Side:</span>
                    <span className={selectedPosition.side === 'long' ? 'text-trading-red' : 'text-trading-green'}>
                      {selectedPosition.side === 'long' ? 'SHORT' : 'LONG'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="text-white">{formatNumber(selectedPosition.size, 4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entry Price:</span>
                    <span className="text-white">
                      {formatPrice(selectedPosition.markPrice)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  This will close your current position and open a new position in the opposite direction at the current market price.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReverseConfirmOpen(false)}
              className="bg-transparent border text-white hover:bg-background-elevated"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReverse}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Reverse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
