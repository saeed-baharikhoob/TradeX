import { OrderbookEntry } from '@/types/trading'
import type { LBankWebSocketMessage } from '@/types/websocket'
import { logger } from '@/lib/utils/logger'
import { APP_CONFIG } from '@/config/constants'

export type WebSocketMessageHandler = (data: LBankWebSocketMessage) => void

interface SubscriptionMessage {
  action: string
  subscribe: string
  pair: string
  depth?: string
}

export class LBankWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = APP_CONFIG.WS_RECONNECT_MAX_ATTEMPTS
  private reconnectDelay = APP_CONFIG.WS_RECONNECT_BASE_DELAY
  private messageHandlers: Map<string, WebSocketMessageHandler[]> = new Map()
  private subscribedChannels: Set<string> = new Set()
  private isConnecting = false

  constructor(private url: string = APP_CONFIG.LBANK_WS_URL) {}

  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve()
    }

    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          logger.ws.connected(this.url)
          this.isConnecting = false
          this.reconnectAttempts = 0

          this.subscribedChannels.forEach((channel) => {
            this.sendSubscription(channel)
          })

          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as LBankWebSocketMessage
            this.handleMessage(data)
          } catch (error) {
            logger.error('Failed to parse WebSocket message', error as Error)
          }
        }

        this.ws.onerror = (error) => {
          logger.ws.error(error)
          this.isConnecting = false
          reject(error)
        }

        this.ws.onclose = () => {
          logger.ws.disconnected(this.url)
          this.isConnecting = false
          this.ws = null
          this.attemptReconnect()
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      logger.ws.reconnecting(this.reconnectAttempts, this.maxReconnectAttempts)

      setTimeout(() => {
        this.connect().catch((error) => logger.ws.error(error))
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      logger.error('Max WebSocket reconnection attempts reached')
    }
  }

  private sendSubscription(channel: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const [type, pair] = channel.split('.')

      const subscription: SubscriptionMessage = {
        action: 'subscribe',
        subscribe: type,
        pair: pair,
      }

      if (type === 'depth') {
        subscription.depth = String(APP_CONFIG.DEFAULT_ORDERBOOK_SIZE)
      }

      this.ws.send(JSON.stringify(subscription))
      logger.ws.subscribed(channel)
    }
  }

  subscribe(channel: string, handler: WebSocketMessageHandler): void {
    const handlers = this.messageHandlers.get(channel) || []
    handlers.push(handler)
    this.messageHandlers.set(channel, handlers)

    this.subscribedChannels.add(channel)

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(channel)
    } else {
      this.connect().then(() => {
        this.sendSubscription(channel)
      }).catch((error) => logger.ws.error(error))
    }
  }

  private sendUnsubscription(channel: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const [type, pair] = channel.split('.')
      const unsubscription = {
        action: 'unsubscribe',
        unsubscribe: type,
        pair: pair,
      }
      this.ws.send(JSON.stringify(unsubscription))
      logger.ws.unsubscribed(channel)
    }
  }

  unsubscribe(channel: string, handler?: WebSocketMessageHandler): void {
    if (handler) {
      const handlers = this.messageHandlers.get(channel) || []
      const filteredHandlers = handlers.filter((h) => h !== handler)

      if (filteredHandlers.length > 0) {
        this.messageHandlers.set(channel, filteredHandlers)
      } else {
        this.messageHandlers.delete(channel)
        this.subscribedChannels.delete(channel)
        this.sendUnsubscription(channel)
      }
    } else {
      this.messageHandlers.delete(channel)
      this.subscribedChannels.delete(channel)
      this.sendUnsubscription(channel)
    }
  }

  private handleMessage(data: LBankWebSocketMessage): void {
    const channel = data.type && data.pair ? `${data.type}.${data.pair}` : null

    if (channel) {
      logger.ws.messageReceived(channel)
      const handlers = this.messageHandlers.get(channel)
      if (handlers) {
        handlers.forEach((handler) => handler(data))
      } else {
        logger.debug('No handlers registered for channel', { channel })
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.subscribedChannels.clear()
      this.messageHandlers.clear()
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

let lbankWS: LBankWebSocket | null = null

export const getLBankWebSocket = (): LBankWebSocket => {
  if (!lbankWS) {
    lbankWS = new LBankWebSocket()
  }
  return lbankWS
}
