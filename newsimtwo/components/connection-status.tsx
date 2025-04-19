"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [lastChecked, setLastChecked] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const checkConnection = async () => {
    try {
      setStatus("checking")
      setErrorMessage("")
      const response = await fetch("/api/trading/bitget/status")
      const data = await response.json()

      if (data.status === "success" && data.connected) {
        setStatus("connected")
      } else {
        setStatus("disconnected")
        setErrorMessage(data.message || "Could not connect to Bitget")
      }

      setLastChecked(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Connection check error:", error)
      setStatus("disconnected")
      setErrorMessage("Connection check failed")
      setLastChecked(new Date().toLocaleTimeString())
    }
  }

  useEffect(() => {
    checkConnection()

    // Check connection status every minute
    const interval = setInterval(checkConnection, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`p-4 rounded-lg border ${
        status === "connected"
          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
          : status === "disconnected"
            ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
            : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
      }`}
    >
      <div className="flex items-center space-x-2">
        {status === "connected" && <CheckCircle className="h-5 w-5 text-green-500" />}

        {status === "disconnected" && <XCircle className="h-5 w-5 text-red-500" />}

        {status === "checking" && <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />}

        <span className="font-medium">
          {status === "connected" && "Connected to Bitget"}
          {status === "disconnected" && "Disconnected from Bitget"}
          {status === "checking" && "Checking Bitget connection..."}
        </span>
      </div>

      {errorMessage && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>Last checked: {lastChecked || "Never"}</span>
        <button
          onClick={checkConnection}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  )
}
