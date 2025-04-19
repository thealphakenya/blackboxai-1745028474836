import { Navbar } from "@/components/navbar"

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  About SimTwo
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  The next generation of AI-powered trading simulation
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Our Mission</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  SimTwo was created with a simple mission: to democratize access to sophisticated trading tools and
                  strategies. We believe that everyone should have the opportunity to test and refine their investment
                  strategies in a risk-free environment before committing real capital.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Our platform combines cutting-edge AI technology with realistic market simulations to provide traders
                  of all experience levels with valuable insights and learning opportunities.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Technology</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Built on a modern tech stack including Python for backend processing, React for the frontend
                  interface, and Docker for containerization, SimTwo leverages the latest advancements in machine
                  learning and financial modeling.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Our AI algorithms analyze vast amounts of historical market data to identify patterns and trends,
                  helping you make more informed trading decisions.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl space-y-4 py-12">
              <h2 className="text-3xl font-bold text-center">Key Features</h2>
              <ul className="grid gap-6 lg:grid-cols-3">
                <li className="rounded-lg border p-6 shadow-sm">
                  <h3 className="text-xl font-bold">Realistic Simulations</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Test strategies against historical market data with realistic execution models, slippage, and fees.
                  </p>
                </li>
                <li className="rounded-lg border p-6 shadow-sm">
                  <h3 className="text-xl font-bold">AI Strategy Optimization</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Let our AI suggest improvements to your trading strategies based on performance analysis.
                  </p>
                </li>
                <li className="rounded-lg border p-6 shadow-sm">
                  <h3 className="text-xl font-bold">Comprehensive Analytics</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Detailed performance metrics and visualizations to help you understand your trading results.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2023 SimTwo Trading Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
