"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { ConnectionStatus } from "@/components/connection-status"
import { AccountBalance } from "@/components/account-balance"
import { TradeHistory } from "@/components/trade-history"
import { PairWeighting } from "@/components/pair-weighting"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Chart from "chart.js/auto"
import { AlertTriangle } from "lucide-react"
// Import the CredentialsVerifier component
import { CredentialsVerifier } from "@/components/credentials-verifier"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT")
  const [prices, setPrices] = useState({
    BTCUSDT: "Loading...",
    ETHUSDT: "Loading...",
    BNBUSDT: "Loading...",
    XRPUSDT: "Loading...",
    DOGEUSDT: "Loading...",
  })
  const [aiStatus, setAiStatus] = useState("ACTIVE")
  const [autoTrading, setAutoTrading] = useState(false)
  const [orderType, setOrderType] = useState("market")
  const [orderAmount, setOrderAmount] = useState("")
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [selectedModel, setSelectedModel] = useState("ensemble")
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! I'm your AI trading assistant. How can I help you today?" },
  ])
  const [chatInput, setChatInput] = useState("")
  const [lstmWeight, setLstmWeight] = useState(0.33)
  const [tradingAiWeight, setTradingAiWeight] = useState(0.33)
  const [reinforcementWeight, setReinforcementWeight] = useState(0.34)
  const [p2pBotStatus, setP2pBotStatus] = useState("Not running")
  const [p2pBalance, setP2pBalance] = useState("Loading...")
  const [p2pBotRunning, setP2pBotRunning] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [trades, setTrades] = useState<any[]>([])
  const [balance, setBalance] = useState("$0.00")
  const [connectionError, setConnectionError] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  // Check Bitget connection status
  useEffect(() => {
    if (!user) return

    const checkConnection = async () => {
      try {
        const response = await fetch("/api/trading/bitget/status")
        const data = await response.json()

        if (data.status === "success" && data.connected) {
          setIsConnected(true)
          setConnectionError("")
        } else {
          setIsConnected(false)
          setConnectionError(data.message || "Could not connect to Bitget")
        }
      } catch (error) {
        setIsConnected(false)
        setConnectionError("Failed to check Bitget connection")
        console.error("Connection check error:", error)
      }
    }

    checkConnection()
  }, [user])

  // Listen for pair selection events
  useEffect(() => {
    const handlePairSelected = (event: CustomEvent) => {
      setActiveSymbol(event.detail.symbol)
    }

    window.addEventListener("pairSelected", handlePairSelected as EventListener)

    return () => {
      window.removeEventListener("pairSelected", handlePairSelected as EventListener)
    }
  }, [])

  // Fetch account balance
  useEffect(() => {
    if (!user) return

    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/trading/balance")

        if (!response.ok) {
          throw new Error("Failed to fetch balance")
        }

        const data = await response.json()
        setBalance(`$${data.totalUsdBalance}`)
      } catch (err) {
        console.error("Error fetching balance:", err)
      }
    }

    fetchBalance()

    // Refresh balance every minute
    const interval = setInterval(fetchBalance, 60000)

    return () => clearInterval(interval)
  }, [user])

  // Fetch trade history for the active symbol
  useEffect(() => {
    if (!user || !activeSymbol) return

    const fetchTrades = async () => {
      try {
        const response = await fetch(`/api/trading/history?symbol=${activeSymbol}`)

        if (!response.ok) {
          throw new Error("Failed to fetch trade history")
        }

        const data = await response.json()
        setTrades(data.trades)
      } catch (err) {
        console.error("Error fetching trade history:", err)
      }
    }

    fetchTrades()
  }, [user, activeSymbol])

  // Initialize chart with trade markers
  useEffect(() => {
    if (chartRef.current && user) {
      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        // Destroy previous chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        // Generate random data for demo
        const labels = Array.from({ length: 30 }, (_, i) => `${i + 1}m`)
        const data = Array.from({ length: 30 }, () => Math.random() * 1000 + 60000)

        // Create new chart
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: `${activeSymbol} Price`,
                data,
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              tooltip: {
                callbacks: {
                  afterLabel: (context) => {
                    // Find if there's a trade at this point
                    const pointIndex = context.dataIndex
                    const trade = trades.find((t) => {
                      // Convert trade timestamp to chart index (simplified)
                      const tradeIndex = Math.floor((Date.now() - t.timestamp) / (60 * 1000)) % 30
                      return tradeIndex === pointIndex
                    })

                    if (trade) {
                      return [
                        `Trade: ${trade.side.toUpperCase()}`,
                        `Amount: ${trade.quantity}`,
                        `Price: ${trade.price}`,
                        `P/L: ${trade.profitLoss > 0 ? "+" : ""}${trade.profitLoss.toFixed(2)}`,
                      ]
                    }
                    return null
                  },
                },
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: "Time",
                },
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: "Price (USDT)",
                },
              },
            },
            // Add annotations for trades
            annotation: {
              annotations: trades.map((trade) => {
                // Convert trade timestamp to chart index (simplified)
                const tradeIndex = Math.floor((Date.now() - trade.timestamp) / (60 * 1000)) % 30

                return {
                  type: "point",
                  xValue: tradeIndex,
                  yValue: Number.parseFloat(trade.price),
                  backgroundColor: trade.side === "buy" ? "rgba(0, 255, 0, 0.8)" : "rgba(255, 0, 0, 0.8)",
                  borderColor: trade.side === "buy" ? "green" : "red",
                  borderWidth: 2,
                  radius: 5,
                  label: {
                    content: trade.side.toUpperCase(),
                    enabled: true,
                    position: "top",
                  },
                }
              }),
            },
          },
        })
      }
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [activeSymbol, user, trades])

  // Simulate price updates
  useEffect(() => {
    if (!user) return

    const updatePrices = () => {
      setPrices((prev) => ({
        BTCUSDT: `${(Math.random() * 1000 + 60000).toFixed(2)}`,
        ETHUSDT: `${(Math.random() * 100 + 3000).toFixed(2)}`,
        BNBUSDT: `${(Math.random() * 10 + 300).toFixed(2)}`,
        XRPUSDT: `${(Math.random() * 0.1 + 0.5).toFixed(4)}`,
        DOGEUSDT: `${(Math.random() * 0.01 + 0.05).toFixed(5)}`,
      }))
    }

    // Initial update
    updatePrices()

    // Set interval for updates
    const interval = setInterval(updatePrices, 5000)

    // Cleanup
    return () => clearInterval(interval)
  }, [user])

  const handleSymbolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveSymbol(e.target.value)
  }

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle("dark")
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value)
  }

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfidenceThreshold(Number.parseFloat(e.target.value))
  }

  const toggleAutoTrading = () => {
    if (!isConnected) {
      alert("Cannot enable auto trading: Not connected to Bitget")
      return
    }
    setAutoTrading(!autoTrading)
  }

  const handleOrderTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderType(e.target.value)
  }

  const handleOrderAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderAmount(e.target.value)
  }

  const placeOrder = async (action: "buy" | "sell") => {
    if (!isConnected) {
      alert("Cannot place order: Not connected to Bitget")
      return
    }

    try {
      const response = await fetch("/api/trading/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: activeSymbol,
          side: action,
          type: orderType,
          quantity: orderAmount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to place order")
      }

      const data = await response.json()
      alert(`${action.toUpperCase()} order placed: ${orderAmount} ${activeSymbol} (${orderType})`)

      // Refresh balance and trades
      const balanceResponse = await fetch("/api/trading/balance")
      const balanceData = await balanceResponse.json()
      setBalance(`$${balanceData.totalUsdBalance}`)

      const tradesResponse = await fetch(`/api/trading/history?symbol=${activeSymbol}`)
      const tradesData = await tradesResponse.json()
      setTrades(tradesData.trades)
    } catch (error) {
      console.error("Error placing order:", error)
      alert(`Error placing order: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const toggleAiStatus = (status: "active" | "stopped") => {
    if (!isConnected && status === "active") {
      alert("Cannot activate AI: Not connected to Bitget")
      return
    }
    setAiStatus(status === "active" ? "ACTIVE" : "STOPPED")
  }

  const emergencyStop = () => {
    setAutoTrading(false)
    setAiStatus("STOPPED")
    alert("EMERGENCY STOP ACTIVATED: All trading has been halted.")
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    // Add user message
    setChatMessages((prev) => [...prev, { role: "user", content: chatInput }])

    // Simulate AI response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've analyzed your request about "${chatInput}". Based on current market conditions, I recommend monitoring ${activeSymbol} closely as it shows promising patterns.`,
        },
      ])
    }, 1000)

    // Clear input
    setChatInput("")
  }

  const updateStrategyWeights = () => {
    // Ensure weights sum to 1
    const sum = lstmWeight + tradingAiWeight + reinforcementWeight
    if (Math.abs(sum - 1) > 0.01) {
      alert(`Weights must sum to 1. Current sum: ${sum.toFixed(2)}`)
      return
    }

    alert(
      `Strategy weights updated: LSTM=${lstmWeight}, Trading AI=${tradingAiWeight}, Reinforcement=${reinforcementWeight}`,
    )
  }

  const toggleP2pBot = () => {
    if (!isConnected) {
      alert("Cannot start P2P bot: Not connected to Bitget")
      return
    }
    setP2pBotRunning(!p2pBotRunning)
    setP2pBotStatus(p2pBotRunning ? "Not running" : "Running")
    // Use the actual balance instead of a hardcoded value
    setP2pBalance(balance)
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <Navbar />
      <main className="flex-1 p-4">
        <div className="container mx-auto">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold mb-2 md:mb-0">SimTwo - AI Trading Dashboard</h1>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-2">
                <label className="switch relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={handleThemeToggle}
                    className="opacity-0 w-0 h-0"
                  />
                  <span className="slider absolute cursor-pointer inset-0 bg-gray-300 dark:bg-gray-600 rounded-full transition-all before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all dark:before:translate-x-6"></span>
                </label>
                <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="symbol-select" className="font-semibold">
                  Active Symbol:
                </label>
                <select
                  id="symbol-select"
                  value={activeSymbol}
                  onChange={handleSymbolChange}
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1"
                >
                  <option value="BTCUSDT">BTCUSDT</option>
                  <option value="ETHUSDT">ETHUSDT</option>
                  <option value="BNBUSDT">BNBUSDT</option>
                  <option value="XRPUSDT">XRPUSDT</option>
                  <option value="DOGEUSDT">DOGEUSDT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bitget Connection Status */}
          <div className="mb-6">
            <ConnectionStatus />
          </div>

          {/* Add the CredentialsVerifier component after the ConnectionStatus component */}
          <div className="mb-6">
            <CredentialsVerifier />
          </div>

          {!isConnected && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Warning: Not connected to Bitget</span>
              </div>
              <p className="mt-2">
                Trading functionality is limited. Please check your API credentials and connection settings.
              </p>
            </div>
          )}

          <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
            <div className="font-semibold">Live Prices:</div>
            <div>
              BTCUSDT: <span className="font-mono">{prices.BTCUSDT}</span>
            </div>
            <div>
              ETHUSDT: <span className="font-mono">{prices.ETHUSDT}</span>
            </div>
            <div>
              BNBUSDT: <span className="font-mono">{prices.BNBUSDT}</span>
            </div>
            <div>
              XRPUSDT: <span className="font-mono">{prices.XRPUSDT}</span>
            </div>
          </div>

          <div className="mb-6 h-[300px] border border-gray-200 dark:border-gray-700 rounded-lg p-2">
            <canvas ref={chartRef} height="300"></canvas>
          </div>

          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div>
                AI Status:{" "}
                <span className={`font-semibold ${aiStatus === "ACTIVE" ? "text-green-500" : "text-red-500"}`}>
                  {aiStatus}
                </span>{" "}
                — Monitoring...
              </div>
            </div>
            <div className="font-semibold">Bitget Balance: {balance}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Trading Controls</h2>

              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Model Configuration</label>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="flex items-center space-x-2">
                      <label htmlFor="model-select">Model:</label>
                      <select
                        id="model-select"
                        value={selectedModel}
                        onChange={handleModelChange}
                        className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1"
                      >
                        <option value="ensemble">Ensemble (All Models)</option>
                        <option value="lstm">LSTM</option>
                        <option value="trading_ai">Trading AI</option>
                        <option value="rl">Reinforcement</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="confidence-input">Confidence Threshold:</label>
                      <input
                        id="confidence-input"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={confidenceThreshold}
                        onChange={handleConfidenceChange}
                        className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 w-20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Order Placement</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={toggleAutoTrading}
                      className={`px-4 py-2 rounded ${
                        autoTrading ? "bg-red-600 text-white" : "bg-green-600 text-white"
                      } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!isConnected}
                    >
                      {autoTrading ? "Stop Auto Trading" : "Start Auto Trading"}
                    </button>
                    <select
                      value={orderType}
                      onChange={handleOrderTypeChange}
                      className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1"
                    >
                      <option value="limit">Limit</option>
                      <option value="market">Market</option>
                    </select>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Order amount"
                      value={orderAmount}
                      onChange={handleOrderAmountChange}
                      className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1"
                    />
                    <button
                      onClick={() => placeOrder("buy")}
                      className={`px-4 py-1 rounded bg-green-600 text-white ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!isConnected}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => placeOrder("sell")}
                      className={`px-4 py-1 rounded bg-red-600 text-white ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!isConnected}
                    >
                      Sell
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-medium">AI Controls</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleAiStatus("active")}
                      className={`px-4 py-2 rounded ${
                        aiStatus === "ACTIVE"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!isConnected}
                    >
                      Set AI Active
                    </button>
                    <button
                      onClick={() => toggleAiStatus("stopped")}
                      className={`px-4 py-2 rounded ${
                        aiStatus === "STOPPED"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      Set AI Stopped
                    </button>
                  </div>
                </div>

                <div>
                  <button onClick={emergencyStop} className="px-4 py-2 rounded bg-red-600 text-white font-bold">
                    EMERGENCY STOP
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Chat with AI</h2>
              <div className="h-[200px] overflow-y-auto mb-4 border border-gray-200 dark:border-gray-700 rounded p-2">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block px-3 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI..."
                  className="flex-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                />
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
                  Send
                </button>
              </form>

              <h3 className="text-lg font-semibold mt-6 mb-2">Strategy Weights</h3>
              <div className="space-y-2">
                <div>
                  <label htmlFor="lstm-weight" className="block mb-1">
                    LSTM: {lstmWeight.toFixed(2)}
                  </label>
                  <input
                    id="lstm-weight"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={lstmWeight}
                    onChange={(e) => setLstmWeight(Number.parseFloat(e.target.value))}
                    className="w-full range-blue"
                  />
                </div>
                <div>
                  <label htmlFor="trading-ai-weight" className="block mb-1">
                    Trading AI: {tradingAiWeight.toFixed(2)}
                  </label>
                  <input
                    id="trading-ai-weight"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={tradingAiWeight}
                    onChange={(e) => setTradingAiWeight(Number.parseFloat(e.target.value))}
                    className="w-full range-green"
                  />
                </div>
                <div>
                  <label htmlFor="reinforcement-weight" className="block mb-1">
                    Reinforcement: {reinforcementWeight.toFixed(2)}
                  </label>
                  <input
                    id="reinforcement-weight"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={reinforcementWeight}
                    onChange={(e) => setReinforcementWeight(Number.parseFloat(e.target.value))}
                    className="w-full range-purple"
                  />
                </div>
                <button
                  onClick={updateStrategyWeights}
                  className={`px-4 py-2 rounded bg-blue-600 text-white mt-2 ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isConnected}
                >
                  Update Strategy
                </button>
              </div>
            </div>
          </div>

          {/* Account Balance */}
          <div className="mb-6">
            <AccountBalance />
          </div>

          {/* Pair Weighting */}
          <div className="mb-6">
            <PairWeighting />
          </div>

          {/* Trade History */}
          <div className="mb-6">
            <TradeHistory />
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Bitget P2P Trading Bot</h2>
            <div className="flex flex-col md:flex-row justify-between">
              <div className="space-y-2 mb-4 md:mb-0">
                <div>
                  Status:{" "}
                  <span className={p2pBotRunning ? "text-green-500 font-semibold" : "text-gray-500"}>
                    {p2pBotStatus}
                  </span>
                </div>
                <div>
                  Balance: <span className="font-semibold">{balance}</span>
                </div>
              </div>
              <div>
                <button
                  onClick={toggleP2pBot}
                  className={`px-4 py-2 rounded ${p2pBotRunning ? "bg-red-600 text-white" : "bg-green-600 text-white"} ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isConnected}
                >
                  {p2pBotRunning ? "Stop Bot" : "Start Bot"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
