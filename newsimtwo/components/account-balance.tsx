"use client"

import { useState, useEffect } from "react"
import { RefreshCw, DollarSign, Wallet, AlertTriangle } from "lucide-react"

type Balance = {
  asset: string
  free: string
  locked: string
  total: string
  usdValue: string
}

export function AccountBalance() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [totalUsdBalance, setTotalUsdBalance] = useState("0.00")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAllAssets, setShowAllAssets] = useState(false)

  useEffect(() => {
    fetchBalance()

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchBalance = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/trading/balance")

      if (!response.ok) {
        throw new Error("Failed to fetch balance")
      }

      const data = await response.json()
      setBalances(data.balances)
      setTotalUsdBalance(data.totalUsdBalance)
      setError("")
    } catch (err) {
      console.error("Error fetching balance:", err)
      setError("Failed to load Bitget balance")
    } finally {
      setLoading(false)
    }
  }

  // Sort balances by USD value (descending)
  const sortedBalances = [...balances].sort((a, b) => Number.parseFloat(b.usdValue) - Number.parseFloat(a.usdValue))

  // Show only top assets or all assets based on showAllAssets state
  const displayedBalances = showAllAssets ? sortedBalances : sortedBalances.slice(0, 5)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Bitget Account Balance
        </h2>
        <button
          onClick={fetchBalance}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center space-x-2 dark:bg-red-900/30 dark:text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Total Bitget Balance:</span>
          <span className="text-2xl font-bold flex items-center">
            <DollarSign className="h-5 w-5 mr-1" />
            {loading ? "Loading..." : totalUsdBalance}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : balances.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No balance data available</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Locked
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    USD Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {displayedBalances.map((balance) => (
                  <tr key={balance.asset} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {balance.asset}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {balance.free}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {balance.locked}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {balance.total}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${Number.parseFloat(balance.usdValue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {balances.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllAssets(!showAllAssets)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                {showAllAssets ? "Show Less" : `Show All (${balances.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
