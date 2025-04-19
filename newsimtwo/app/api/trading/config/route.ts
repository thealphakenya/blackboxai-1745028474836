import { NextResponse } from "next/server"
import { tradingConfig, aiConfig, loggingConfig } from "@/lib/env"

// This endpoint returns non-sensitive configuration
// to the frontend client
export async function GET() {
  return NextResponse.json({
    trading: {
      aiAutoTrade: tradingConfig.aiAutoTrade,
      autoTradeEnabled: tradingConfig.autoTradeEnabled,
      aiActive: tradingConfig.aiActive,
      useVirtualAccount: tradingConfig.useVirtualAccount,
      orderType: tradingConfig.orderType,
      defaultSymbol: tradingConfig.defaultSymbol,
      maxOpenTrades: tradingConfig.maxOpenTrades,
      refreshIntervalSec: tradingConfig.refreshIntervalSec,
    },
    ai: {
      lstmWeight: aiConfig.lstmWeight,
      tradingAiWeight: aiConfig.tradingAiWeight,
      reinforcementWeight: aiConfig.reinforcementWeight,
      confidenceThreshold: aiConfig.confidenceThreshold,
    },
    logging: {
      logLevel: loggingConfig.logLevel,
      verbose: loggingConfig.verbose,
    },
  })
}
