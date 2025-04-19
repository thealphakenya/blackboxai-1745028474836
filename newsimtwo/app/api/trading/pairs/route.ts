import { NextResponse } from "next/server"
import { getBitgetApi } from "lib/bitget-api"
import { query } from "lib/database"

type TradingPairRow = {
  symbol: string
  last_price: string
  price_change_percent: string
  volume: string
  quote_volume: string
}

export async function GET() {
  try {
    const bitgetApi = getBitgetApi()
    const pairs = await bitgetApi.getTradingPairs()

    // Save pairs to database
    for (const pair of pairs) {
      await query(
        `INSERT INTO trading_pairs (symbol, last_price, price_change_percent, volume, quote_volume, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (symbol) DO UPDATE SET last_price = EXCLUDED.last_price, price_change_percent = EXCLUDED.price_change_percent, volume = EXCLUDED.volume, quote_volume = EXCLUDED.quote_volume, updated_at = NOW()`,
        [pair.symbol, pair.lastPrice, pair.priceChangePercent, pair.volume, pair.quoteVolume]
      )
    }

    return NextResponse.json({ pairs })
  } catch (error) {
    console.error("Error fetching trading pairs:", error)

    // On error, try to fetch pairs from database as fallback
    try {
      const res = await query("SELECT symbol, last_price, price_change_percent, volume, quote_volume FROM trading_pairs")
      const pairs = res.rows.map((row: TradingPairRow) => ({
        symbol: row.symbol,
        lastPrice: row.last_price,
        priceChangePercent: row.price_change_percent,
        volume: row.volume,
        quoteVolume: row.quote_volume,
      }))

      return NextResponse.json({ pairs })
    } catch (dbError) {
      console.error("Error fetching trading pairs from database:", dbError)
      return NextResponse.json({ error: "Failed to fetch trading pairs" }, { status: 500 })
    }
  }
}
