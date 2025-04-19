"use client"

import { useState, useEffect } from "react"
import { RefreshCw, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

type TradingPair = {
  symbol: string
  lastPrice: string
  priceChangePercent: string
  volume: string
  quoteVolume: string
  score?: number
}

export function PairWeighting() {
  const [pairs, setPairs] = useState<TradingPair[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPair, setSelectedPair] = useState<string | null>(null)

  useEffect(() => {
    fetchPairs()

    // Refresh pairs every 30 seconds
    const interval = setInterval(fetchPairs, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchPairs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/trading/pairs")

      if (!response.ok) {
        throw new Error("Failed to fetch trading pairs")
      }

      const data = await response.json()

      // Calculate score for each pair based on volume and price change
      const scoredPairs = data.pairs.map((pair: TradingPair) => {
        const volumeScore = Math.log10(Number.parseFloat(pair.quoteVolume) + 1) / 10
        const changeScore = Math.abs(Number.parseFloat(pair.priceChangePercent)) / 10
        const score = volumeScore + changeScore

        return {
          ...pair,
          score,
        }
      })

      // Sort by score (descending)
      const sortedPairs = scoredPairs.sort((a: TradingPair, b: TradingPair) => (b.score || 0) - (a.score || 0))

      setPairs(sortedPairs)

      // Set the highest scored pair as selected
      if (sortedPairs.length > 0 && !selectedPair) {
        setSelectedPair(sortedPairs[0].symbol)
      }

      setError("")
    } catch (err) {
      console.error("Error fetching trading pairs:", err)
      setError("Failed to load trading pairs")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPair = (symbol: string) => {
    setSelectedPair(symbol)
    // Dispatch an event that the dashboard can listen to
    const event = new CustomEvent("pairSelected", { detail: { symbol } })
    window.dispatchEvent(event)
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Pair Weighting
        </h2>
        <button
          onClick={fetchPairs}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : pairs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No trading pairs available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pair
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {pairs.map((pair) => (
                <tr
                  key={pair.symbol}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedPair === pair.symbol ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {pair.symbol}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {pair.lastPrice}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center ${
                        Number.parseFloat(pair.priceChangePercent) > 0
                          ? "text-green-600 dark:text-green-400"
                          : Number.parseFloat(pair.priceChangePercent) < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {Number.parseFloat(pair.priceChangePercent) > 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : Number.parseFloat(pair.priceChangePercent) < 0 ? (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      ) : null}
                      {pair.priceChangePercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {Number.parseFloat(pair.quoteVolume).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {(pair.score || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleSelectPair(pair.symbol)}
                      className={`px-2 py-1 text-xs rounded ${
                        selectedPair === pair.symbol
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {selectedPair === pair.symbol ? "Selected" : "Select"}
                    </button>
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
