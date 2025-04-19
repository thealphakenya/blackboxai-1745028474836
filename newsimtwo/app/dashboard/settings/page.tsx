import { Navbar } from "@/components/navbar"
import { TradingConfigPanel } from "@/components/trading-config-panel"

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6">
          <div className="flex flex-col space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Trading Settings</h1>
              <p className="text-gray-500 dark:text-gray-400">Configure your trading parameters and AI settings</p>
            </div>

            <TradingConfigPanel />
          </div>
        </div>
      </main>
    </div>
  )
}
