// Environment variable access with type safety
// This file provides a safe way to access environment variables

// Trading configuration
export const tradingConfig = {
  aiAutoTrade: process.env.AI_AUTO_TRADE === "true",
  autoTradeEnabled: process.env.AUTO_TRADE_ENABLED === "true",
  aiActive: process.env.AI_ACTIVE === "true",
  useVirtualAccount: process.env.USE_VIRTUAL_ACCOUNT === "true",
  orderType: process.env.ORDER_TYPE || "market",
  defaultSymbol: process.env.DEFAULT_SYMBOL || "auto",
  maxOpenTrades: Number.parseInt(process.env.MAX_OPEN_TRADES || "3", 10),
  refreshIntervalSec: Number.parseInt(process.env.REFRESH_INTERVAL_SEC || "5", 10),
}

// AI configuration
export const aiConfig = {
  lstmWeight: Number.parseFloat(process.env.LSTM_WEIGHT || "0.25"),
  tradingAiWeight: Number.parseFloat(process.env.TRADING_AI_WEIGHT || "0.5"),
  reinforcementWeight: Number.parseFloat(process.env.REINFORCEMENT_WEIGHT || "0.25"),
  confidenceThreshold: Number.parseFloat(process.env.CONFIDENCE_THRESHOLD || "0.7"),
}

// API credentials - these should only be accessed server-side
export const getApiCredentials = () => {
  // This function should only be called in server components or API routes
  return {
    bitget: {
      apiKey: process.env.BITGET_API_KEY,
      secretKey: process.env.BITGET_SECRET_KEY,
      passphrase: process.env.BITGET_PASSPHRASE,
    },
  }
}

// Logging configuration
export const loggingConfig = {
  logLevel: process.env.LOG_LEVEL || "info",
  verbose: process.env.VERBOSE === "1",
}

// Environment mode
export const isProduction = process.env.ENV === "prod"
