import { NextResponse } from "next/server"
import { getBitgetApi } from "@/lib/bitget-api"

export async function GET() {
  try {
    const bitgetApi = getBitgetApi()

    // Try to fetch account balance to verify connection
    const balances = await bitgetApi.getAccountBalance()

    if (!balances || balances.length === 0) {
      return NextResponse.json({
        status: "error",
        connected: false,
        message: "Could not retrieve account data from Bitget",
      })
    }

    return NextResponse.json({
      status: "success",
      connected: true,
      message: "Successfully connected to Bitget API",
    })
  } catch (error) {
    console.error("Bitget connection error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json({
      status: "error",
      connected: false,
      message: `Failed to connect to Bitget: ${errorMessage}`,
    })
  }
}
