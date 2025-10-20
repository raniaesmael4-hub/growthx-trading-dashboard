import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import ProfitCalculator from "@/components/ProfitCalculator";
import BacktestingMetrics from "@/components/BacktestingMetrics";
import LiveTrades from "@/components/LiveTrades";

const SYMBOL = "BINANCE:SOLUSDT";

export default function Dashboard() {
  const [initialized, setInitialized] = useState(false);

  // Initialize backtesting metrics on mount
  const initMetrics = trpc.trading.initializeMetrics.useMutation();

  useEffect(() => {
    if (!initialized) {
      initMetrics.mutate({
        symbol: SYMBOL,
        initialCapital: 10000,
        netProfit: 77953.88,
        netProfitPercent: 779.54,
        totalTrades: 24431,
        winRate: 73.64,
        avgPnl: 3.19,
        profitFactor: 1.441,
        maxDrawdown: 7884.11,
        monthlyReturnPercent: 12.99,
        quarterlyReturnPercent: 38.98,
        annualReturnPercent: 155.91,
      });
      setInitialized(true);
    }
  }, [initialized, initMetrics]);

  // Fetch backtesting metrics
  const { data: metrics } = trpc.trading.getBacktestingMetrics.useQuery(
    { symbol: SYMBOL },
    { enabled: initialized }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
              <p className="text-slate-400 mt-1">SOL/USDT Strategy Performance</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 font-semibold">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Net Profit Card */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${parseFloat(metrics.netProfit?.toString() || "0").toLocaleString()}
                </div>
                <p className="text-sm text-green-400 mt-1">
                  +{metrics.netProfitPercent}%
                </p>
              </CardContent>
            </Card>

            {/* Win Rate Card */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metrics.winRate}%
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {metrics.totalTrades?.toLocaleString()} trades
                </p>
              </CardContent>
            </Card>

            {/* Profit Factor Card */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  Profit Factor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metrics.profitFactor}
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Risk/Reward Ratio
                </p>
              </CardContent>
            </Card>

            {/* Max Drawdown Card */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Max Drawdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${parseFloat(metrics.maxDrawdown?.toString() || "0").toLocaleString()}
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  7.67% of capital
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
            <TabsTrigger 
              value="calculator"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Profit Calculator
            </TabsTrigger>
            <TabsTrigger 
              value="backtesting"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Backtesting Results
            </TabsTrigger>
            <TabsTrigger 
              value="trades"
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Live Trades
            </TabsTrigger>
          </TabsList>

          {/* Profit Calculator Tab */}
          <TabsContent value="calculator" className="mt-6">
            <ProfitCalculator metrics={metrics} />
          </TabsContent>

          {/* Backtesting Results Tab */}
          <TabsContent value="backtesting" className="mt-6">
            <BacktestingMetrics metrics={metrics} />
          </TabsContent>

          {/* Live Trades Tab */}
          <TabsContent value="trades" className="mt-6">
            <LiveTrades />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

