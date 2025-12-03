# TradeX - Crypto Futures Trading Platform

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A frontend-only demo of the Futures trading module of a cryptocurrency exchange.
This project focuses specifically on the trading interface (chart, orderbook, positions, order forms, etc.) and does not represent a full exchange. It is built as a portfolio project to demonstrate the implementation  of a professional futures trading UI similar to Binance and Bybit.

## 🚀 Live Demo

| Application                       | Live Demo | Description |
|-----------------------------------|-----------|-------------|
| **🛍️ Futures Trading Platform ** | [**🔗 View Demo**](https://TradeX-futures.vercel.app/) | A frontend demo of a crypto Futures trading module |



## 🚀 Features

### Trading Platform
- **Real-time Market Data**: Live price updates via WebSocket integration with LBank API
- **Advanced Charting**: Interactive TradingView charts with multiple timeframes
- **Order Book**: Real-time bid/ask order book with depth visualization
- **Leverage Trading**: Adjustable leverage up to 100x with cross/isolated margin modes
- **Multiple Order Types**: Market orders, limit orders, and advanced TP/SL functionality
- **Position Management**: Track open positions, orders, and P&L in real-time
- **Responsive Design**: Optimized layouts for both desktop and mobile devices
- **100+ Trading Pairs**: Support for major cryptocurrencies including BTC, ETH, SOL, and more

### Technical Features
- **WebSocket Integration**: Real-time ticker and orderbook updates
- **State Management**: Centralized Redux store with Redux Toolkit
- **Type Safety**: Full TypeScript support across the entire application
- **Modern UI**: Radix UI primitives with Tailwind CSS styling
- **Error Handling**: Comprehensive error boundaries and toast notifications
- **API Routes**: Next.js API routes for secure backend integration

## 📦 Tech Stack

### Core Technologies
- **[Next.js](https://nextjs.org/)** (v16.0.0) - React framework with App Router
- **[React](https://react.dev/)** (v19.2.0) - UI library
- **[TypeScript](https://www.typescriptlang.org/)** (v5) - Type safety
- **[Redux Toolkit](https://redux-toolkit.js.org/)** (v2.2.1) - State management
- **[Tailwind CSS](https://tailwindcss.com/)** (v3.4.1) - Utility-first CSS

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI primitives
  - Dialog, Dropdown Menu, Select, Switch, Tabs, Checkbox
- **[Lucide React](https://lucide.dev/)** - Modern icon library
- **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications

### Trading & Charts
- **[Lightweight Charts](https://tradingview.github.io/lightweight-charts/)** (v4.1.3) - Advanced charting library
- **[React TradingView Embed](https://www.npmjs.com/package/react-tradingview-embed)** - TradingView widget integration
- **LBank API** - Real-time market data and WebSocket feeds

### Additional Libraries
- **[React Hook Form](https://react-hook-form.com/)** (v7.66.1) - Form management
- **[Class Variance Authority](https://cva.style/)** - Component variants
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Conditional styling

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ or Node.js 20+
- Yarn or npm
- Git

### Clone the repository
```bash
git clone https://github.com/saeed-baharikhoob/TradeX
cd TradeX
```

### Install dependencies
```bash
yarn install
# or
npm install
```

### Running the application

#### Development mode
```bash
yarn dev
# or
npm run dev
```
The app will be available at `http://localhost:3000`

#### Production build
```bash
yarn build
# or
npm run build
```

#### Start production server
```bash
yarn start
# or
npm start
```

## 📁 Project Structure

```
TradeX/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── api/                    # API routes
│   │   │   └── lbank/              # LBank API integration
│   │   │       ├── depth/          # Orderbook depth endpoint
│   │   │       ├── kline/          # Candlestick data endpoint
│   │   │       └── ticker/         # Ticker data endpoint
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Trading page
│   │
│   ├── components/
│   │   ├── layout/                 # Layout components
│   │   │   ├── DesktopTradingLayout.tsx
│   │   │   └── MobileTradingLayout.tsx
│   │   ├── shared/                 # Shared components
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── PnlDisplay.tsx
│   │   │   └── PriceDisplay.tsx
│   │   ├── ui/                     # UI primitives (Radix UI)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   └── tabs.tsx
│   │   ├── ClientLayout.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── features/                    # Feature-based modules
│   │   ├── chart/                  # Trading charts
│   │   │   └── components/
│   │   │       └── TradingViewChart.tsx
│   │   ├── market-info/            # Market information header
│   │   │   └── components/
│   │   │       ├── MarketInfoHeader.tsx
│   │   │       └── TickerSwitcherModal.tsx
│   │   ├── orderbook/              # Order book display
│   │   │   └── components/
│   │   │       ├── Orderbook.tsx
│   │   │       └── OrderbookRow.tsx
│   │   ├── positions/              # Positions & orders management
│   │   │   └── components/
│   │   │       ├── OrderRow.tsx
│   │   │       ├── PositionRow.tsx
│   │   │       └── PositionsTable.tsx
│   │   └── trading-form/           # Trading form
│   │       ├── components/
│   │       │   ├── OrderConfirmModal.tsx
│   │       │   └── TradingForm.tsx
│   │       └── hooks/
│   │
│   ├── lib/
│   │   ├── api/                    # API clients
│   │   │   └── lbankApi.ts
│   │   ├── redux/                  # Redux store configuration
│   │   │   ├── slices/
│   │   │   │   ├── marketSlice.ts
│   │   │   │   ├── orderbookSlice.ts
│   │   │   │   └── tradingSlice.ts
│   │   │   ├── selectors/
│   │   │   ├── hooks.ts
│   │   │   ├── provider.tsx
│   │   │   └── store.ts
│   │   ├── utils/                  # Utility functions
│   │   │   ├── errors.ts
│   │   │   ├── orderbook-utils.ts
│   │   │   ├── ticker-utils.ts
│   │   │   └── trading-calculations.ts
│   │   ├── websocket/              # WebSocket clients
│   │   │   └── lbankWebSocket.ts
│   │   └── utils.ts
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── trading.ts
│   │   └── websocket.ts
│   │
│   └── styles/
│       └── globals.css             # Global styles
│
├── public/                         # Static assets
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

## 🚀 Available Scripts

### Development
```bash
# Development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linter
yarn lint
```

## 🎯 Key Features Explained

### 1. Trading Form
- **Order Types**: Market and Limit orders
- **Leverage Selection**: Adjustable from 1x to 100x
- **Margin Modes**: Cross margin and Isolated margin
- **TP/SL**: Take Profit and Stop Loss with multiple trigger types (Last, Mark, Index)
- **Margin Percentage**: Easy margin allocation with percentage slider

### 2. Real-time Market Data
- **WebSocket Integration**: Live updates for tickers and orderbook
- **Auto-refresh**: Market data refreshes every 30 seconds
- **100+ Trading Pairs**: Automatically fetched from LBank API
- **Sorted by Volume**: Major coins prioritized (BTC, ETH, SOL, etc.)

### 3. Order Book
- **Real-time Updates**: WebSocket-powered orderbook depth
- **Aggregated Levels**: Configurable price grouping
- **Depth Visualization**: Visual representation of bid/ask depth
- **Click to Trade**: Click on price levels to auto-fill order form

### 4. Position Management
- **Open Positions**: Track all active positions with real-time P&L
- **Open Orders**: Monitor pending orders
- **Order History**: View completed trades
- **Position Actions**: Close, modify TP/SL, adjust margin

### 5. Responsive Design
- **Desktop Layout**: Multi-panel grid layout with chart, orderbook, and trading form
- **Mobile Layout**: Optimized bottom sheet navigation for smaller screens
- **Touch-friendly**: Mobile-first interaction patterns

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Add any API keys or configuration here
NEXT_PUBLIC_API_URL=https://api.lbank.com
```

### Customization
- **Trading Pairs**: Modify the pair filtering logic in `src/app/page.tsx`
- **Leverage Options**: Adjust available leverage in `src/features/trading-form/components/TradingForm.tsx`
- **Theme**: Customize colors in `tailwind.config.ts` and `src/styles/globals.css`
- **Chart Settings**: Configure TradingView widget in `src/features/chart/components/TradingViewChart.tsx`

## 🔍 API Integration

This project integrates with the LBank API for market data:

### API Endpoints Used
- **Tickers**: `/v2/ticker/24hr.do` - Get 24h ticker data
- **Order Book**: `/v2/depth.do` - Get market depth
- **Klines**: `/v2/kline.do` - Get candlestick data

### WebSocket Feeds
- **Ticker Updates**: Real-time price and volume updates
- **Order Book Updates**: Real-time bid/ask updates


## 📞 Contact

LinkedIn: [https://www.linkedin.com/in/saeed-baharikhoob/](https://www.linkedin.com/in/saeed-baharikhoob/)

GitHub: [@saeed-baharikhoob](https://github.com/saeed-baharikhoob)
