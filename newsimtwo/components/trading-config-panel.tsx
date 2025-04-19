"use client"

import { useState, useEffect } from "react"
import { Settings, Save, RefreshCw } from "lucide-react"

export function TradingConfigPanel() {
  const [config, setConfig] = useState({
    trading: {
      aiAutoTrade: false,
      autoTradeEnabled: false,
      aiActive: false,
      useVirtualAccount: false,
      orderType: "market",
      defaultSymbol: "auto",
      maxOpenTrades: 3,
      refreshIntervalSec: 5,
    },
    ai: {
      lstmWeight: 0.25,
      tradingAiWeight: 0.5,
      reinforcementWeight: 0.25,
      confidenceThreshold: 0.7,
    },
    logging: {
      logLevel: "info",
      verbose: false,
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Fetch configuration from the API
    const fetchConfig = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/trading/config")
        if (!response.ok) {
          throw new Error("Failed to fetch configuration")
        }
        const data = await response.json()
        setConfig(data)
        setError("")
      } catch (err) {
        setError("Failed to load configuration")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleChange = (section: string, key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // In a real implementation, you would save the configuration to the server
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaving(false)
      setError("")
    } catch (err) {
      setError("Failed to save configuration")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 border rounded-lg">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading configuration...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Trading Configuration
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Trading Settings</h3>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2">AI Auto Trade</span>
              <input
                type="checkbox"
                checked={config.trading.aiAutoTrade}
                onChange={(e) => handleChange("trading", "aiAutoTrade", e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2">Auto Trade Enabled</span>
              <input
                type="checkbox"
                checked={config.trading.autoTradeEnabled}
                onChange={(e) => handleChange("trading", "autoTradeEnabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2">AI Active</span>
              <input
                type="checkbox"
                checked={config.trading.aiActive}
                onChange={(e) => handleChange("trading", "aiActive", e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2">Use Virtual Account</span>
              <input
                type="checkbox"
                checked={config.trading.useVirtualAccount}
                onChange={(e) => handleChange("trading", "useVirtualAccount", e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order Type</label>
            <select
              value={config.trading.orderType}
              onChange={(e) => handleChange("trading", "orderType", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop">Stop</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Symbol</label>
            <input
              type="text"
              value={config.trading.defaultSymbol}
              onChange={(e) => handleChange("trading", "defaultSymbol", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Open Trades</label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.trading.maxOpenTrades}
              onChange={(e) => handleChange("trading", "maxOpenTrades", Number.parseInt(e.target.value, 10))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Refresh Interval (seconds)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.trading.refreshIntervalSec}
              onChange={(e) => handleChange("trading", "refreshIntervalSec", Number.parseInt(e.target.value, 10))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">AI Settings</h3>

          <div>
            <label className="block text-sm font-medium mb-1">LSTM Weight</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.ai.lstmWeight}
              onChange={(e) => handleChange("ai", "lstmWeight", Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{config.ai.lstmWeight.toFixed(2)}</span>
              <span>1</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Trading AI Weight</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.ai.tradingAiWeight}
              onChange={(e) => handleChange("ai", "tradingAiWeight", Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{config.ai.tradingAiWeight.toFixed(2)}</span>
              <span>1</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reinforcement Weight</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.ai.reinforcementWeight}
              onChange={(e) => handleChange("ai", "reinforcementWeight", Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{config.ai.reinforcementWeight.toFixed(2)}</span>
              <span>1</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confidence Threshold</label>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={config.ai.confidenceThreshold}
              onChange={(e) => handleChange("ai", "confidenceThreshold", Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5</span>
              <span>{config.ai.confidenceThreshold.toFixed(2)}</span>
              <span>0.95</span>
            </div>
          </div>

          <h3 className="font-medium border-b pb-2 mt-8">Logging Settings</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Log Level</label>
            <select
              value={config.logging.logLevel}
              onChange={(e) => handleChange("logging", "logLevel", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <span className="mr-2">Verbose Logging</span>
              <input
                type="checkbox"
                checked={config.logging.verbose}
                onChange={(e) => handleChange("logging", "verbose", e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
