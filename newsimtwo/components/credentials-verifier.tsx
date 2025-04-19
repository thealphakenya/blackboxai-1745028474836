"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Key } from "lucide-react"

export function CredentialsVerifier() {
  const [status, setStatus] = useState<"valid" | "invalid" | "checking" | "not-configured">("checking")
  const [message, setMessage] = useState<string>("")
  const [credentials, setCredentials] = useState<{
    apiKey: string
    secretKey: string
    passphrase: string
  }>({
    apiKey: "Unknown",
    secretKey: "Unknown",
    passphrase: "Unknown",
  })

  const verifyCredentials = async () => {
    try {
      setStatus("checking")
      setMessage("")

      const response = await fetch("/api/trading/verify-credentials")
      const data = await response.json()

      if (data.status === "success") {
        setStatus("valid")
      } else if (
        data.credentials &&
        (data.credentials.apiKey === "Not set" ||
          data.credentials.secretKey === "Not set" ||
          data.credentials.passphrase === "Not set")
      ) {
        setStatus("not-configured")
      } else {
        setStatus("invalid")
      }

      setMessage(data.message)
      setCredentials(
        data.credentials || {
          apiKey: "Unknown",
          secretKey: "Unknown",
          passphrase: "Unknown",
        },
      )
    } catch (error) {
      console.error("Credentials verification error:", error)
      setStatus("invalid")
      setMessage("Failed to verify credentials")
    }
  }

  useEffect(() => {
    verifyCredentials()
  }, [])

  return (
    <div
      className={`p-4 rounded-lg border ${
        status === "valid"
          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
          : status === "invalid"
            ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
            : status === "not-configured"
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
              : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
      }`}
    >
      <div className="flex items-center space-x-2">
        {status === "valid" && <CheckCircle className="h-5 w-5 text-green-500" />}
        {status === "invalid" && <XCircle className="h-5 w-5 text-red-500" />}
        {status === "not-configured" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
        {status === "checking" && <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />}

        <span className="font-medium">
          {status === "valid" && "Bitget API Credentials Verified"}
          {status === "invalid" && "Invalid Bitget API Credentials"}
          {status === "not-configured" && "Bitget API Credentials Not Configured"}
          {status === "checking" && "Checking Bitget API Credentials..."}
        </span>
      </div>

      {message && <div className="mt-2 text-sm">{message}</div>}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4" />
          <span className="text-sm">API Key: </span>
          <span className={`text-sm font-medium ${credentials.apiKey === "Set" ? "text-green-500" : "text-red-500"}`}>
            {credentials.apiKey}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4" />
          <span className="text-sm">Secret Key: </span>
          <span
            className={`text-sm font-medium ${credentials.secretKey === "Set" ? "text-green-500" : "text-red-500"}`}
          >
            {credentials.secretKey}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4" />
          <span className="text-sm">Passphrase: </span>
          <span
            className={`text-sm font-medium ${credentials.passphrase === "Set" ? "text-green-500" : "text-red-500"}`}
          >
            {credentials.passphrase}
          </span>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          onClick={verifyCredentials}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Verify Again</span>
        </button>
      </div>
    </div>
  )
}
