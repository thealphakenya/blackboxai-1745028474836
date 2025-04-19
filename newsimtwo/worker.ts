import { startQueue, worker } from "./lib/queue"
import { aiService } from "./lib/ai-service"
import type { Job } from "bullmq"

worker.on("active", async (job: Job) => {
  if (job.name === "ai-evaluate-trade") {
    try {
      await aiService.evaluateAndTrade()
    } catch (error) {
      console.error("AI evaluation and trading failed:", error)
    }
  }
})

startQueue().catch((err) => {
  console.error("Failed to start queue:", err)
  process.exit(1)
})
