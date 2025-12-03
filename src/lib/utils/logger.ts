type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'info'

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel]
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (context) {
      return `${prefix} ${message} ${JSON.stringify(context)}`
    }

    return `${prefix} ${message}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, error?: Error | LogContext): void {
    if (this.shouldLog('error')) {
      if (error instanceof Error) {
        console.error(this.formatMessage('error', message), error)
      } else {
        console.error(this.formatMessage('error', message, error))
      }
    }
  }

  ws = {
    connected: (url: string) => this.info('WebSocket connected', { url }),
    disconnected: (url: string) => this.info('WebSocket disconnected', { url }),
    error: (error: any) => this.error('WebSocket error', error instanceof Error ? error : new Error(String(error))),
    subscribed: (channel: string) => this.debug('WebSocket subscribed', { channel }),
    unsubscribed: (channel: string) => this.debug('WebSocket unsubscribed', { channel }),
    messageReceived: (channel: string) => this.debug('WebSocket message received', { channel }),
    reconnecting: (attempt: number, max: number) => this.info('WebSocket reconnecting', { attempt, max }),
  }

  api = {
    request: (endpoint: string) => this.debug('API request', { endpoint }),
    response: (endpoint: string) => this.debug('API response', { endpoint }),
    error: (endpoint: string, error: Error) => this.error(`API error: ${endpoint}`, error),
  }
}

export const logger = new Logger()
