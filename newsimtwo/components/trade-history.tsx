"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"

type Trade = {
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

export function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null)

  useEffect(() => {
    fetchTrades()
  }, [activeSymbol])

  const fetchTrades = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/trading/history${activeSymbol ? `?symbol=${activeSymbol}` : ""}`)

      if (!response.ok) {
        throw new Error("Failed to fetch trade history")
      }

      const data = await response.json()
      setTrades(data.trades)
      setError("")
    } catch (err) {
      console.error("Error fetching trade history:", err)
      setError("Failed to load trade history")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const filterBySymbol = (symbol: string | null) => {
    setActiveSymbol(symbol)
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Trade History</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => filterBySymbol(null)}
            className={`px-2 py-1 text-xs rounded ${
              activeSymbol === null
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => filterBySymbol("BTCUSDT")}
            className={`px-2 py-1 text-xs rounded ${
              activeSymbol === "BTCUSDT"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            BTCUSDT
          </button>
          <button
            onClick={() => filterBySymbol("ETHUSDT")}
            className={`px-2 py-1 text-xs rounded ${
              activeSymbol === "ETHUSDT"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            ETHUSDT
          </button>
          <button
            onClick={fetchTrades}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No trades found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pair
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  P/L
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(trade.timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {trade.symbol}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.side === "buy"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {trade.side === "buy" ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {trade.price}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {trade.quantity}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {trade.total}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center ${
                        trade.profitLoss > 0
                          ? "text-green-600 dark:text-green-400"
                          : trade.profitLoss < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {trade.profitLoss > 0 ? "+" : ""}
                      {trade.profitLoss.toFixed(2)} ({trade.profitLossPercentage > 0 ? "+" : ""}
                      {trade.profitLossPercentage.toFixed(2)}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
