import { tradingConfig, aiConfig } from "./env"
import { query } from "./database"
import { jobQueue } from "./queue"
import { getBitgetApi } from "./bitget-api"

type AIModelOutput = {
  confidence: number
  action: "buy" | "sell" | "hold"
  details?: any
}

export class AIService {
  private bitgetApi = getBitgetApi()
  private modelCache: Map<string, any> = new Map()

  constructor() {
    this.loadModels()
  }

  private async loadModels() {
    this.modelCache.set("lstm", {})
    this.modelCache.set("tradingAi", {})
    this.modelCache.set("reinforcement", {})
  }

  async computeDecision(marketData: any, tradeHistory: any): Promise<AIModelOutput> {
    const lstmOutput = await this.runLSTMModel(marketData, tradeHistory)
    const tradingAiOutput = await this.runTradingAIModel(marketData, tradeHistory)
    const reinforcementOutput = await this.runReinforcementModel(marketData, tradeHistory)

    const combinedConfidence =
      lstmOutput.confidence * aiConfig.lstmWeight +
      tradingAiOutput.confidence * aiConfig.tradingAiWeight +
      reinforcementOutput.confidence * aiConfig.reinforcementWeight

    const actions = [lstmOutput, tradingAiOutput, reinforcementOutput].map((o) => o.action)
    const action = this.majorityVote(actions)

    return {
      confidence: combinedConfidence,
      action,
      details: { lstmOutput, tradingAiOutput, reinforcementOutput },
    }
  }

  private majorityVote(actions: string[]): "buy" | "sell" | "hold" {
    const counts = { buy: 0, sell: 0, hold: 0 }
    actions.forEach((a) => {
      counts[a as keyof typeof counts]++
    })
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as "buy" | "sell" | "hold") || "hold"
  }

  private async runLSTMModel(marketData: any, tradeHistory: any): Promise<AIModelOutput> {
    return { confidence: 0.8, action: "buy" }
  }

  private async runTradingAIModel(marketData: any, tradeHistory: any): Promise<AIModelOutput> {
    return { confidence: 0.9, action: "buy" }
  }

  private async runReinforcementModel(marketData: any, tradeHistory: any): Promise<AIModelOutput> {
    return { confidence: 0.85, action: "buy" }
  }

  async evaluateAndTrade() {
    const marketData = await this.fetchMarketData()
    const tradeHistory = await this.fetchTradeHistory()

    const decision = await this.computeDecision(marketData, tradeHistory)

    if (decision.confidence >= aiConfig.confidenceThreshold) {
      await this.placeOrder(decision.action, marketData)
      await this.saveDecision(decision)
    }

    this.trainModels(marketData, tradeHistory)
  }

  async fetchMarketData() {
    return {}
  }

  async fetchTradeHistory() {
    return {}
  }

  async placeOrder(action: "buy" | "sell" | "hold", marketData: any) {
    if (action === "hold") return
  }

  async saveDecision(decision: AIModelOutput) {}

  async trainModels(marketData: any, tradeHistory: any) {}
}

export const aiService = new AIService()

export async function scheduleAIJob() {
  await jobQueue.add("ai-evaluate-trade", {}, { repeat: { every: tradingConfig.refreshIntervalSec * 1000 } })
}
