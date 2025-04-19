// Bitget API integration service

type BitgetCredentials = {
  apiKey: string
  secretKey: string
  passphrase: string
}

type BitgetBalance = {
  asset: string
  free: string
  locked: string
  total: string
  usdValue: string
}

type BitgetTrade = {
  id: string
  symbol: string
  side: "buy" | "sell"
  price: string
  quantity: string
  timestamp: number
  total: string
  fee: string
  feeCoin: string
  status: string
  profitLoss: number
  profitLossPercentage: number
}

export class BitgetAPI {
  private apiKey: string
  private secretKey: string
  private passphrase: string
  private baseUrl = "https://api.bitget.com"

  constructor(credentials: BitgetCredentials) {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey
    this.passphrase = credentials.passphrase
  }

  // Generate signature for Bitget API
  private generateSignature(timestamp: string, method: string, requestPath: string, body = ""): string {
    const message = timestamp + method + requestPath + body

    // Use the crypto module to create the HMAC signature
    const crypto = require("crypto")
    const hmac = crypto.createHmac("sha256", this.secretKey)
    hmac.update(message)
    return hmac.digest("base64")
  }

  // Make authenticated request to Bitget API
  private async makeRequest(method: string, endpoint: string, params: any = null): Promise<any> {
    try {
      const timestamp = Date.now().toString()
      const requestPath = `/api/spot/v1${endpoint}`
      const url = `${this.baseUrl}${requestPath}`

      const body = params && method === "POST" ? JSON.stringify(params) : ""
      const signature = this.generateSignature(timestamp, method, requestPath, body)

      const headers = {
        "ACCESS-KEY": this.apiKey,
        "ACCESS-SIGN": signature,
        "ACCESS-TIMESTAMP": timestamp,
        "ACCESS-PASSPHRASE": this.passphrase,
        "Content-Type": "application/json",
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        body: method === "POST" && params ? body : undefined,
      }

      // Make the actual API call
      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        throw new Error(`Bitget API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Bitget API request failed:", error)
      throw error
    }
  }

  // Get account balances
  async getAccountBalance(): Promise<BitgetBalance[]> {
    return this.makeRequest("GET", "/account/assets")
  }

  // Get trading pairs
  async getTradingPairs(): Promise<any[]> {
    return this.makeRequest("GET", "/market/tickers")
  }

  // Get historical trades
  async getHistoricalTrades(symbol: string): Promise<BitgetTrade[]> {
    return this.makeRequest("GET", `/market/fills?symbol=${symbol}`)
  }

  // Place order
  async placeOrder(symbol: string, side: "buy" | "sell", type: string, quantity: string, price?: string): Promise<any> {
    const params = {
      symbol,
      side,
      orderType: type,
      quantity,
      price: price || undefined,
    }

    return this.makeRequest("POST", "/trade/orders", params)
  }

  // Get open orders
  async getOpenOrders(symbol?: string): Promise<any[]> {
    const endpoint = symbol ? `/trade/open-orders?symbol=${symbol}` : "/trade/open-orders"
    return this.makeRequest("GET", endpoint)
  }

  // Get order history
  async getOrderHistory(symbol?: string): Promise<BitgetTrade[]> {
    const endpoint = symbol ? `/trade/history?symbol=${symbol}` : "/trade/history"
    return this.makeRequest("GET", endpoint)
  }

  // Mock responses for development
  private getMockResponse(endpoint: string): any {
    if (endpoint.includes("/account/assets")) {
      return [
        { asset: "BTC", free: "0.12345678", locked: "0.00000000", total: "0.12345678", usdValue: "7456.23" },
        { asset: "ETH", free: "2.34567890", locked: "0.10000000", total: "2.44567890", usdValue: "4532.12" },
        { asset: "USDT", free: "5432.10", locked: "100.00", total: "5532.10", usdValue: "5532.10" },
      ]
    }

    if (endpoint.includes("/market/tickers")) {
      return [
        {
          symbol: "BTCUSDT",
          lastPrice: "60123.45",
          priceChangePercent: "2.34",
          volume: "1234.56",
          quoteVolume: "74123456.78",
        },
        {
          symbol: "ETHUSDT",
          lastPrice: "3456.78",
          priceChangePercent: "1.23",
          volume: "5678.90",
          quoteVolume: "19654321.09",
        },
        {
          symbol: "BNBUSDT",
          lastPrice: "345.67",
          priceChangePercent: "0.45",
          volume: "12345.67",
          quoteVolume: "4321098.76",
        },
        {
          symbol: "XRPUSDT",
          lastPrice: "0.5678",
          priceChangePercent: "-1.23",
          volume: "9876543.21",
          quoteVolume: "5432109.87",
        },
        {
          symbol: "DOGEUSDT",
          lastPrice: "0.0765",
          priceChangePercent: "5.67",
          volume: "123456789.01",
          quoteVolume: "9876543.21",
        },
      ]
    }

    if (endpoint.includes("/trade/history") || endpoint.includes("/market/fills")) {
      return [
        {
          id: "123456",
          symbol: "BTCUSDT",
          side: "buy",
          price: "59876.54",
          quantity: "0.01",
          timestamp: Date.now() - 3600000 * 24,
          total: "598.77",
          fee: "0.59",
          feeCoin: "USDT",
          status: "FILLED",
          profitLoss: 123.45,
          profitLossPercentage: 2.34,
        },
        {
          id: "123457",
          symbol: "ETHUSDT",
          side: "sell",
          price: "3456.78",
          quantity: "0.5",
          timestamp: Date.now() - 3600000 * 12,
          total: "1728.39",
          fee: "1.73",
          feeCoin: "USDT",
          status: "FILLED",
          profitLoss: -45.67,
          profitLossPercentage: -1.23,
        },
        {
          id: "123458",
          symbol: "BTCUSDT",
          side: "buy",
          price: "60123.45",
          quantity: "0.005",
          timestamp: Date.now() - 3600000 * 6,
          total: "300.62",
          fee: "0.30",
          feeCoin: "USDT",
          status: "FILLED",
          profitLoss: 56.78,
          profitLossPercentage: 3.45,
        },
        {
          id: "123459",
          symbol: "BNBUSDT",
          side: "buy",
          price: "345.67",
          quantity: "1",
          timestamp: Date.now() - 3600000 * 3,
          total: "345.67",
          fee: "0.35",
          feeCoin: "USDT",
          status: "FILLED",
          profitLoss: 12.34,
          profitLossPercentage: 0.98,
        },
        {
          id: "123460",
          symbol: "ETHUSDT",
          side: "buy",
          price: "3478.90",
          quantity: "0.2",
          timestamp: Date.now() - 3600000,
          total: "695.78",
          fee: "0.70",
          feeCoin: "USDT",
          status: "FILLED",
          profitLoss: -23.45,
          profitLossPercentage: -0.67,
        },
      ]
    }

    if (endpoint.includes("/trade/open-orders")) {
      return [
        {
          id: "123461",
          symbol: "BTCUSDT",
          side: "buy",
          price: "59000.00",
          quantity: "0.01",
          timestamp: Date.now() - 1800000,
          total: "590.00",
          status: "NEW",
        },
        {
          id: "123462",
          symbol: "ETHUSDT",
          side: "sell",
          price: "3500.00",
          quantity: "0.3",
          timestamp: Date.now() - 900000,
          total: "1050.00",
          status: "NEW",
        },
      ]
    }

    return { message: "No mock data available for this endpoint" }
  }
}

// Create and export a singleton instance
let bitgetApiInstance: BitgetAPI | null = null

export function getBitgetApi(): BitgetAPI {
  if (!bitgetApiInstance) {
    // Get credentials from environment variables
    const credentials = {
      apiKey: process.env.BITGET_API_KEY || "",
      secretKey: process.env.BITGET_SECRET_KEY || "",
      passphrase: process.env.BITGET_PASSPHRASE || "",
    }

    bitgetApiInstance = new BitgetAPI(credentials)
  }

  return bitgetApiInstance
}
