import { NextResponse } from "next/server"
import { getBitgetApi } from "lib/bitget-api"
import { query } from "lib/database"

type TradeRow = {
  id: string
  symbol: string
  side: string
  price: string
  quantity: string
  timestamp: number
  total: string
  fee: string
  fee_coin: string
  status: string
  profit_loss: number
  profit_loss_percentage: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")

    const bitgetApi = getBitgetApi()
    const trades = await bitgetApi.getOrderHistory(symbol || undefined)

    // Save trades to database
    for (const trade of trades) {
      await query(
        `INSERT INTO trades (id, symbol, side, price, quantity, timestamp, total, fee, fee_coin, status, profit_loss, profit_loss_percentage, updated_at)
         VALUES ($1, $2, $3, $4, $5, to_timestamp($6 / 1000.0), $7, $8, $9, $10, $11, $12, NOW())
         ON CONFLICT (id) DO UPDATE SET symbol = EXCLUDED.symbol, side = EXCLUDED.side, price = EXCLUDED.price, quantity = EXCLUDED.quantity, timestamp = EXCLUDED.timestamp, total = EXCLUDED.total, fee = EXCLUDED.fee, fee_coin = EXCLUDED.fee_coin, status = EXCLUDED.status, profit_loss = EXCLUDED.profit_loss, profit_loss_percentage = EXCLUDED.profit_loss_percentage, updated_at = NOW()`,
        [trade.id, trade.symbol, trade.side, trade.price, trade.quantity, trade.timestamp, trade.total, trade.fee, trade.feeCoin, trade.status, trade.profitLoss, trade.profitLossPercentage]
      )
    }

    return NextResponse.json({ trades })
  } catch (error) {
    console.error("Error fetching trade history:", error)

    // On error, try to fetch trades from database as fallback
    try {
      const res = await query("SELECT id, symbol, side, price, quantity, extract(epoch from timestamp) * 1000 as timestamp, total, fee, fee_coin, status, profit_loss, profit_loss_percentage FROM trades")
      const trades = res.rows.map((row: TradeRow) => ({
        id: row.id,
        symbol: row.symbol,
        side: row.side,
        price: row.price,
        quantity: row.quantity,
        timestamp: row.timestamp,
        total: row.total,
        fee: row.fee,
        feeCoin: row.fee_coin,
        status: row.status,
        profitLoss: row.profit_loss,
        profitLossPercentage: row.profit_loss_percentage,
      }))

      return NextResponse.json({ trades })
    } catch (dbError) {
      console.error("Error fetching trades from database:", dbError)
      return NextResponse.json({ error: "Failed to fetch trade history" }, { status: 500 })
    }
  }
}
