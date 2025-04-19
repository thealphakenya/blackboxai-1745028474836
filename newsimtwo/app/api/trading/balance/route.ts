import { NextResponse } from "next/server"
import { getBitgetApi } from "lib/bitget-api"
import { query } from "lib/database"

type BalanceRow = {
  asset: string
  free: string
  locked: string
  total: string
  usd_value: string
}

export async function GET() {
  try {
    const bitgetApi = getBitgetApi()
    const balances = await bitgetApi.getAccountBalance()

    // Save balances to database
    for (const balance of balances) {
      await query(
        `INSERT INTO balances (asset, free, locked, total, usd_value, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (asset) DO UPDATE SET free = EXCLUDED.free, locked = EXCLUDED.locked, total = EXCLUDED.total, usd_value = EXCLUDED.usd_value, updated_at = NOW()`,
        [balance.asset, balance.free, balance.locked, balance.total, balance.usdValue]
      )
    }

    // Calculate total balance in USD
    const totalUsdBalance = balances.reduce((total: number, balance: { usdValue: string }) => {
      return total + Number.parseFloat(balance.usdValue)
    }, 0)

    return NextResponse.json({
      balances,
      totalUsdBalance: totalUsdBalance.toFixed(2),
    })
  } catch (error) {
    console.error("Error fetching account balance:", error)

    // On error, try to fetch balances from database as fallback
    try {
      const res = await query("SELECT asset, free, locked, total, usd_value FROM balances")
      const balances = res.rows.map((row: BalanceRow) => ({
        asset: row.asset,
        free: row.free,
        locked: row.locked,
        total: row.total,
        usdValue: row.usd_value,
      }))

      const totalUsdBalance = balances.reduce((total: number, balance: { usdValue: string }) => total + Number.parseFloat(balance.usdValue), 0)

      return NextResponse.json({
        balances,
        totalUsdBalance: totalUsdBalance.toFixed(2),
      })
    } catch (dbError) {
      console.error("Error fetching balances from database:", dbError)
      return NextResponse.json({ error: "Failed to fetch account balance" }, { status: 500 })
    }
  }
}
