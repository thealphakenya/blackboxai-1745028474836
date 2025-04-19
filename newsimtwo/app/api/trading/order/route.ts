import { NextResponse } from "next/server"
import { getBitgetApi } from "@/lib/bitget-api"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { symbol, side, type, quantity, price } = body

    if (!symbol || !side || !type || !quantity) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const bitgetApi = getBitgetApi()
    const order = await bitgetApi.placeOrder(symbol, side, type, quantity, price)

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error placing order:", error)
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 })
  }
}
