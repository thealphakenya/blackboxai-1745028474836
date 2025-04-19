import { NextResponse } from "next/server"
import { getBitgetApi } from "@/lib/bitget-api"

export async function GET() {
  try {
    // Check if the environment variables are set
    const apiKey = process.env.BITGET_API_KEY
    const secretKey = process.env.BITGET_SECRET_KEY
    const passphrase = process.env.BITGET_PASSPHRASE

    if (!apiKey || !secretKey || !passphrase) {
      return NextResponse.json({
        status: "error",
        message: "Bitget API credentials are not configured",
        credentials: {
          apiKey: apiKey ? "Set" : "Not set",
          secretKey: secretKey ? "Set" : "Not set",
          passphrase: passphrase ? "Set" : "Not set",
        },
      })
    }

    // Try to connect to Bitget API
    const bitgetApi = getBitgetApi()

    // Test the connection by fetching account balance
    await bitgetApi.getAccountBalance()

    return NextResponse.json({
      status: "success",
      message: "Bitget API credentials are valid",
      credentials: {
        apiKey: "Set",
        secretKey: "Set",
        passphrase: "Set",
      },
    })
  } catch (error) {
    console.error("Error verifying Bitget credentials:", error)
    return NextResponse.json(
      {
        status: "error",
        message: `Failed to verify Bitget credentials: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
