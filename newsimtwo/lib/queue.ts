import { Queue, Worker, QueueScheduler } from "bullmq"
import { redisClient, connectRedis } from "./redis"

const queueName = "background-jobs"

export const queueScheduler = new QueueScheduler(queueName, { connection: redisClient })
export const jobQueue = new Queue(queueName, { connection: redisClient })

export const worker = new Worker(
  queueName,
  async (job) => {
    console.log("Processing job:", job.name, job.data)
    // Implement job processing logic here, e.g., AI learning, trading automation
  },
  { connection: redisClient }
)

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`)
})

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} has failed with error: ${err.message}`)
})

export async function startQueue() {
  await connectRedis()
  await queueScheduler.waitUntilReady()
  await worker.waitUntilReady()
  console.log("Queue and worker started")
}
